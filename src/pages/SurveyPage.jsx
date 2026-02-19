import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNPSData } from '../hooks/useNPSData';
import './SurveyPage.css';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORIES = [
    { key: 'service', label: 'Service', icon: '🤝', description: 'Staff helpfulness & professionalism' },
    { key: 'foodQuality', label: 'Food Quality', icon: '🍽️', description: 'Taste, freshness & presentation' },
    { key: 'facilities', label: 'Facilities', icon: '🏢', description: 'Comfort & amenities' },
    { key: 'cleanliness', label: 'Cleanliness', icon: '✨', description: 'Hygiene & tidiness' },
    { key: 'valueForMoney', label: 'Value for Money', icon: '💰', description: 'Price vs. quality ratio' },
];

const EMOJIS = [
    { score: 1, emoji: '😡', label: 'Very Unsatisfied', color: '#C0392B' },
    { score: 2, emoji: '😞', label: 'Unsatisfied', color: '#E67E22' },
    { score: 3, emoji: '😐', label: 'Neutral', color: '#F1C40F' },
    { score: 4, emoji: '😊', label: 'Satisfied', color: '#27AE60' },
    { score: 5, emoji: '😄', label: 'Very Satisfied', color: '#2E9E6B' },
];

function getNPSColor(score) {
    if (score <= 6) return '#C0392B';
    if (score <= 8) return '#F1C40F';
    return '#2E9E6B';
}

const currentDate = new Date('2026-02-18T15:18:57+08:00');
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

function getYearOptions() {
    const years = [];
    for (let y = currentYear - 2; y <= currentYear + 2; y++) years.push(y);
    return years;
}

export default function SurveyPage() {
    const navigate = useNavigate();
    const { saveResponse, error: hookError } = useNPSData();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [globalNPS, setGlobalNPS] = useState(null);
    const [categoryScores, setCategoryScores] = useState({}); // { service: 4, foodQuality: 5 ... }
    const [toast, setToast] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    // Check completeness
    const isGlobalNPSSet = globalNPS !== null;
    const areAllCategoriesSet = CATEGORIES.every(c => categoryScores[c.key] !== undefined);
    const isComplete = isGlobalNPSSet && areAllCategoriesSet;

    const setCategoryScore = (catKey, score) => {
        setCategoryScores(prev => ({ ...prev, [catKey]: score }));
    };

    const handleSubmit = async () => {
        if (!isComplete) return;
        setSubmitted(true); // Disable button immediately

        const response = {
            month,
            year,
            globalNPS,
            categories: categoryScores
        };

        const success = await saveResponse(response);

        if (success) {
            setToast({ type: 'success', message: 'Response submitted successfully!' });
            setTimeout(() => {
                setToast(null);
                navigate('/dashboard');
            }, 2000);
        } else {
            setToast({ 
                type: 'error', 
                message: hookError || 'Failed to submit. Please check your Firebase configuration in src/firebase.js' 
            });
            setSubmitted(false);
        }
    };

    const handleReset = () => {
        setGlobalNPS(null);
        setCategoryScores({});
        setSubmitted(false);
    };

    const completedCount = (globalNPS !== null ? 1 : 0) + Object.keys(categoryScores).length;
    const totalSteps = 1 + CATEGORIES.length;

    return (
        <div className="page survey-page fade-in">
            {toast && (
                <div className="toast-container">
                    <div className={`toast toast-${toast.type}`}>
                        <span className="toast-icon">{toast.type === 'success' ? '✅' : '❌'}</span>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div className="section-label">Customer Feedback</div>
                <h1 className="page-title">Net Promoter Score Survey</h1>
                <p className="page-subtitle">Share your experience to help us improve our services</p>
            </div>

            {/* Month/Year Selector */}
            <div className="card card-gold survey-period">
                <div className="survey-period-header">
                    <div>
                        <div className="section-label">Survey Period</div>
                        <h3>Select Month & Year</h3>
                    </div>
                    <div className="period-selectors">
                        <select
                            className="select-input"
                            value={month}
                            onChange={e => setMonth(Number(e.target.value))}
                        >
                            {MONTHS.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select
                            className="select-input"
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                        >
                            {getYearOptions().map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="survey-progress">
                <div className="progress-info">
                    <span className="progress-label">Progress</span>
                    <span className="progress-count">{Math.round((completedCount / totalSteps) * 100)}% Complete</span>
                </div>
                <div className="progress-bar-track">
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${(completedCount / totalSteps) * 100}%`,
                            background: 'linear-gradient(90deg, var(--gold), var(--gold-dark))'
                        }}
                    />
                </div>
            </div>

            {/* Global NPS Section */}
            <div className={`card global-nps-card ${globalNPS !== null ? 'completed' : ''}`}>
                <div className="section-label">Overall Recommendation</div>
                <h3 className="question-text">How likely is it that you would recommend our service to a friend or colleague?</h3>

                <div className="nps-scale-wrapper">
                    <div className="nps-labels">
                        <span className="nps-label-text">Not at all likely</span>
                        <span className="nps-label-text">Extremely likely</span>
                    </div>
                    <div className="nps-scale">
                        {Array.from({ length: 11 }, (_, i) => (
                            <button
                                key={i}
                                className={`nps-btn ${globalNPS === i ? 'nps-selected' : ''}`}
                                style={{
                                    '--nps-color': getNPSColor(i),
                                    background: globalNPS === i ? getNPSColor(i) : undefined,
                                    color: globalNPS === i ? '#fff' : undefined
                                }}
                                onClick={() => setGlobalNPS(i)}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                    <div className="nps-range-labels">
                        <span style={{ color: '#C0392B' }}>Detractors (0–6)</span>
                        <span style={{ color: '#F1C40F' }}>Passives (7–8)</span>
                        <span style={{ color: '#2E9E6B' }}>Promoters (9–10)</span>
                    </div>
                </div>
            </div>

            <div className="gold-divider" />

            {/* Category Satisfaction Section */}
            <div className="categories-section">
                <div className="section-header">
                    <h2 className="section-title">Category Satisfaction</h2>
                    <p className="section-subtitle">Please rate your experience in specific areas</p>
                </div>

                <div className="categories-grid">
                    {CATEGORIES.map((cat, idx) => {
                        const score = categoryScores[cat.key];
                        const isCatComplete = score !== undefined;
                        return (
                            <div
                                key={cat.key}
                                className={`card category-card ${isCatComplete ? 'category-complete' : ''}`}
                                style={{ animationDelay: `${idx * 0.08}s` }}
                            >
                                <div className="category-header">
                                    <div className="category-icon-wrapper">
                                        <span className="category-icon">{cat.icon}</span>
                                    </div>
                                    <div className="category-info">
                                        <h4 className="category-title">{cat.label}</h4>
                                        <p className="category-desc">{cat.description}</p>
                                    </div>
                                    {isCatComplete && <div className="category-check">✓</div>}
                                </div>

                                <div className="emoji-row">
                                    {EMOJIS.map(e => (
                                        <button
                                            key={e.score}
                                            className={`emoji-btn ${score === e.score ? 'emoji-selected' : ''}`}
                                            style={{ '--emoji-color': e.color }}
                                            onClick={() => setCategoryScore(cat.key, e.score)}
                                            title={e.label}
                                        >
                                            <span className="emoji-icon">{e.emoji}</span>
                                            <span className="emoji-label">{e.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Submit */}
            <div className="survey-actions">
                <button className="btn btn-outline" onClick={handleReset}>
                    Reset
                </button>
                <button
                    className="btn btn-gold submit-btn"
                    onClick={handleSubmit}
                    disabled={!isComplete || submitted}
                >
                    {submitted ? (
                        <>✓ Submitted</>
                    ) : (
                        <>
                            Submit Response
                        </>
                    )}
                </button>
            </div>

            {!isComplete && (
                <p className="submit-hint">Please complete all fields to submit</p>
            )}
        </div>
    );
}
