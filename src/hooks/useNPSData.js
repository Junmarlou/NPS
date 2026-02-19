import { useState, useEffect, useCallback } from 'react';
import { db, isConfigured } from '../firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, doc } from 'firebase/firestore';

export function useNPSData(targetMonth = null, targetYear = null) {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch data only if month/year are provided (Dashboard mode)
    useEffect(() => {
        // Check if Firebase is configured
        if (!isConfigured) {
            setError("Firebase is not configured. Please update your Firebase credentials in src/firebase.js");
            setLoading(false);
            return;
        }

        if (!db) {
            setError("Database connection failed");
            setLoading(false);
            return;
        }

        // SurveyPage mode: Don't load data, just ready for saving
        if (targetMonth === null || targetYear === null) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            // Set a timeout to prevent indefinite loading
            const timeoutId = setTimeout(() => {
                setError("Request timed out. Please check your Firebase configuration and internet connection.");
                setLoading(false);
            }, 10000); // 10 second timeout

            try {
                // Optimized: Fetch once instead of real-time listener
                // This is faster for initial load and avoids socket overhead for large datasets
                const q = query(
                    collection(db, 'nps_responses'),
                    where('month', '==', targetMonth),
                    where('year', '==', targetYear)
                );

                const querySnapshot = await getDocs(q);
                clearTimeout(timeoutId); // Clear timeout on success
                
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort in memory to avoid index requirements
                data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

                setResponses(data);
                setError(null);
            } catch (error) {
                clearTimeout(timeoutId);
                console.error("Error fetching NPS data:", error);
                setError(`Failed to load data: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [targetMonth, targetYear]);

    const saveResponse = async (response) => {
        try {
            if (!isConfigured) {
                console.error("Firebase is not configured");
                throw new Error("Firebase is not configured. Please update your Firebase credentials.");
            }
            if (!db) throw new Error("Database not connected");
            
            await addDoc(collection(db, 'nps_responses'), {
                ...response,
                submittedAt: new Date().toISOString()
            });
            return true;
        } catch (e) {
            console.error("Error adding document: ", e);
            return false;
        }
    };

    const getResponsesByMonthYear = useCallback((month, year) => {
        return responses.filter(r => r.month === month && r.year === year);
    }, [responses]);

    // Deprecated/Typescript-safe stub
    const getAvailableMonths = () => [];

    // Robust metrics computation (memoized outside)
    const computeMetrics = (data) => {
        if (!data || data.length === 0) return null;

        const categories = ['service', 'foodQuality', 'facilities', 'cleanliness', 'valueForMoney'];
        const categoryLabels = {
            service: 'Service',
            foodQuality: 'Food Quality',
            facilities: 'Facilities',
            cleanliness: 'Cleanliness',
            valueForMoney: 'Value for Money',
        };

        const total = data.length;

        // Per-category metrics
        const categoryMetrics = categories.map(cat => {
            const scores = data.map(r => {
                if (r.categories && r.categories[cat]) return r.categories[cat];
                if (r[cat]?.emoji) return r[cat].emoji;
                return 0;
            }).filter(s => s > 0);

            const satisfied = scores.filter(s => s >= 4).length;
            const neutral = scores.filter(s => s === 3).length;
            const unsatisfied = scores.filter(s => s <= 2).length;
            const satisfactionPct = scores.length > 0 ? (satisfied / scores.length) * 100 : 0;

            let status = 'Needs Improvement';
            if (satisfactionPct >= 80) status = 'Excellent';
            else if (satisfactionPct >= 60) status = 'Good';

            return {
                key: cat,
                label: categoryLabels[cat],
                satisfactionPct: Math.round(satisfactionPct * 10) / 10,
                satisfied,
                neutral,
                unsatisfied,
                total: scores.length,
                status,
            };
        });

        const overallSatisfactionPct =
            categoryMetrics.reduce((sum, c) => sum + c.satisfactionPct, 0) / categories.length;

        const topCategory = [...categoryMetrics].sort((a, b) => b.satisfactionPct - a.satisfactionPct)[0];
        const bottomCategory = [...categoryMetrics].sort((a, b) => a.satisfactionPct - b.satisfactionPct)[0];

        const npsScores = data.map(r => {
            if (r.globalNPS !== undefined) return r.globalNPS;
            return -1;
        }).filter(s => s >= 0);

        let npsScore = 0;
        let avgGlobalScore = 0;

        if (npsScores.length > 0) {
            const promoters = npsScores.filter(s => s >= 9).length;
            const detractors = npsScores.filter(s => s <= 6).length;
            npsScore = Math.round(((promoters - detractors) / npsScores.length) * 100);
            avgGlobalScore = Math.round((npsScores.reduce((a, b) => a + b, 0) / npsScores.length) * 10) / 10;
        }

        return {
            total,
            overallSatisfactionPct: Math.round(overallSatisfactionPct * 10) / 10,
            npsScore,
            avgGlobalScore,
            topCategory,
            bottomCategory,
            categoryMetrics,
        };
    };

    return {
        responses,
        loading,
        error,
        saveResponse,
        getResponsesByMonthYear,
        getAvailableMonths,
        computeMetrics
    };
}
