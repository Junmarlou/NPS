import { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useNPSData } from '../hooks/useNPSData';
import ExportPDFButton from '../components/ExportPDFButton';
import './DashboardPage.css';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const currentDate = new Date('2026-02-18T15:18:57+08:00');
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

function getStatusBadge(status) {
    if (status === 'Excellent') return { cls: 'badge-success', icon: '✅' };
    if (status === 'Good') return { cls: 'badge-warning', icon: '🟡' };
    return { cls: 'badge-danger', icon: '🔴' };
}

function getBarColor(pct) {
    if (pct >= 80) return '#2E9E6B';
    if (pct >= 60) return '#F1C40F';
    return '#C0392B';
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="tooltip-label">{label}</p>
                <p className="tooltip-value">{payload[0].value.toFixed(1)}% Satisfaction</p>
            </div>
        );
    }
    return null;
};

// Generate options for the last 12 months (static list since we don't load all data)
const getStaticAvailableMonths = () => {
    const options = [];
    let y = currentYear;
    let m = currentMonth;
    for (let i = 0; i < 12; i++) {
        options.push({ month: m, year: y });
        m--;
        if (m < 1) { m = 12; y--; }
    }
    return options;
};

export default function DashboardPage() {
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // Optimization: Pass selected period to hook to fetch ONLY that data
    const { loading, responses, error, computeMetrics } = useNPSData(selectedMonth, selectedYear);

    const metrics = useMemo(() => computeMetrics(responses), [responses, computeMetrics]);

    const chartData = metrics?.categoryMetrics.map(c => ({
        name: c.label.replace(' ', '\n'),
        shortName: c.label === 'Value for Money' ? 'Value' : c.label === 'Food Quality' ? 'Food' : c.label === 'Cleanliness' ? 'Clean.' : c.label,
        satisfaction: c.satisfactionPct,
        status: c.status,
    })) || [];

    const availableMonths = getStaticAvailableMonths();

    const getYearOptions = () => {
        // Just show current year and previous year
        return [currentYear, currentYear - 1];
    };

    const generateStrengths = (metrics) => {
        if (!metrics) return [];
        return metrics.categoryMetrics
            .filter(c => c.satisfactionPct >= 80)
            .sort((a, b) => b.satisfactionPct - a.satisfactionPct)
            .map(c => `${c.label} achieved the highest satisfaction rate at ${c.satisfactionPct}%, indicating strong performance in this area.`);
    };

    const generateImprovements = (metrics) => {
        if (!metrics) return [];
        return metrics.categoryMetrics
            .filter(c => c.satisfactionPct < 60)
            .sort((a, b) => a.satisfactionPct - b.satisfactionPct)
            .map(c => `${c.label} scored ${c.satisfactionPct}% satisfaction — focused improvements in this area could significantly boost overall scores.`);
    };

    const generateOverallAssessment = (metrics, month, year) => {
        if (!metrics) return '';
        const monthName = MONTHS[month - 1];
        const pct = metrics.overallSatisfactionPct;
        let qualifier = 'satisfactory';
        if (pct >= 90) qualifier = 'excellent';
        else if (pct >= 80) qualifier = 'strong';
        else if (pct >= 70) qualifier = 'good';
        else if (pct >= 60) qualifier = 'moderate';
        else if (pct < 50) qualifier = 'below expectations';
        return `Based on ${metrics.total} responses collected in ${monthName} ${year}, the overall satisfaction rate of ${pct}% demonstrates ${qualifier} performance across all categories.`;
    };

    const strengths = generateStrengths(metrics);
    const improvements = generateImprovements(metrics);
    const overallAssessment = generateOverallAssessment(metrics, selectedMonth, selectedYear);

    if (loading) {
        return (
            <div className="page dashboard-page fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div style={{ color: 'var(--gold)', fontSize: '1.2rem', fontWeight: 600 }}>Loading data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page dashboard-page fade-in">
                <div className="empty-state card" style={{ margin: '2rem auto', border: '2px solid #C0392B' }}>
                    <div className="empty-icon" style={{ fontSize: '3rem' }}>⚠️</div>
                    <h3 style={{ color: '#C0392B' }}>Configuration Error</h3>
                    <p style={{ marginBottom: '1rem' }}>{error}</p>
                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', textAlign: 'left', maxWidth: '600px', margin: '1rem auto' }}>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>To fix this:</p>
                        <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                            <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>Firebase Console</a></li>
                            <li>Create a new project or select your existing project</li>
                            <li>Go to Project Settings → General → Your apps</li>
                            <li>Copy your Firebase configuration</li>
                            <li>Update the values in <code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>src/firebase.js</code></li>
                            <li>Restart your development server</li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page dashboard-page fade-in">
            <div className="page-header">
                <div className="section-label">Analytics</div>
                <h1 className="page-title">Monthly Satisfaction Metrics</h1>

                <p className="page-subtitle">Performance analysis and insights for selected period</p>
                <div style={{ marginTop: '16px' }}>
                    <ExportPDFButton
                        data={metrics}
                        month={selectedMonth}
                        year={selectedYear}
                        chartData={chartData}
                        fileName={`NPS_Report_${selectedMonth}_${selectedYear}.pdf`}
                    />
                </div>
            </div>

            <div className="dashboard-content">

                {/* Filter */}
                <div className="card card-gold dashboard-filter">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label className="filter-label">Month</label>
                            <select
                                className="select-input"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(Number(e.target.value))}
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Year</label>
                            <select
                                className="select-input"
                                value={selectedYear}
                                onChange={e => setSelectedYear(Number(e.target.value))}
                            >
                                {getYearOptions().map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Quick Select</label>
                            <select
                                className="select-input"
                                value=""
                                onChange={e => {
                                    const [y, m] = e.target.value.split('-');
                                    setSelectedYear(Number(y));
                                    setSelectedMonth(Number(m));
                                }}
                            >
                                <option value="">— Jump to period —</option>
                                {availableMonths.map(({ month, year }) => (
                                    <option key={`${year}-${month}`} value={`${year}-${month}`}>
                                        {MONTHS[month - 1]} {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {!metrics ? (
                    <div className="empty-state card">
                        <div className="empty-icon">📊</div>
                        <h3>No Data Available</h3>
                        <p>No survey responses found for {MONTHS[selectedMonth - 1]} {selectedYear}.</p>
                        <p className="empty-hint">Submit a survey response to see analytics here.</p>
                    </div>
                ) : (
                    <>
                        {/* Executive Summary */}
                        <section className="dashboard-section">
                            <div className="section-label">Executive Summary</div>
                            <div className="summary-cards">
                                <div className="card summary-card">
                                    <div className="summary-icon">📋</div>
                                    <div className="summary-value">{metrics.total}</div>
                                    <div className="summary-title">Total Responses</div>
                                    <div className="summary-sub">{MONTHS[selectedMonth - 1]} {selectedYear}</div>
                                </div>

                                <div className="card summary-card card-gold">
                                    <div className="summary-icon">⭐</div>
                                    <div className="summary-value gold-text">{metrics.npsScore}</div>
                                    <div className="summary-title">Net Promoter Score</div>
                                    <div className="summary-sub">Range: -100 to +100</div>
                                </div>

                                <div className="card summary-card">
                                    <div className="summary-icon">📈</div>
                                    <div className="summary-value">{metrics.overallSatisfactionPct}%</div>
                                    <div className="summary-title">Overall Satisfaction</div>
                                    <div className="summary-sub">
                                        <span className={`badge ${metrics.overallSatisfactionPct >= 80 ? 'badge-success' : metrics.overallSatisfactionPct >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                                            {metrics.overallSatisfactionPct >= 80 ? 'Excellent' : metrics.overallSatisfactionPct >= 60 ? 'Good' : 'Needs Work'}
                                        </span>
                                    </div>
                                </div>

                                <div className="card summary-card">
                                    <div className="summary-icon">🏆</div>
                                    <div className="summary-value top-cat">{metrics.topCategory?.label || 'N/A'}</div>
                                    <div className="summary-title">Top Category</div>
                                    <div className="summary-sub">{metrics.topCategory?.satisfactionPct}% satisfaction</div>
                                </div>
                            </div>
                        </section>

                        {/* Chart */}
                        <section className="dashboard-section">
                            <div className="section-label">Satisfaction Overview</div>
                            <div className="card chart-card">
                                <h3 className="chart-title">Category Satisfaction Rate (%)</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                        <XAxis
                                            dataKey="shortName"
                                            tick={{ fill: '#5C6480', fontSize: 12, fontWeight: 500 }}
                                            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fill: '#5C6480', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={v => `${v}%`}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                        <Bar dataKey="satisfaction" radius={[6, 6, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={index} fill={getBarColor(entry.satisfaction)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="chart-legend">
                                    <span className="legend-item"><span className="legend-dot" style={{ background: '#2E9E6B' }} />Excellent (≥80%)</span>
                                    <span className="legend-item"><span className="legend-dot" style={{ background: '#F1C40F' }} />Good (60–79%)</span>
                                    <span className="legend-item"><span className="legend-dot" style={{ background: '#C0392B' }} />Needs Improvement (&lt;60%)</span>
                                </div>
                            </div>
                        </section>

                        {/* Performance Analysis Table */}
                        <section className="dashboard-section">
                            <div className="section-label">Performance Analysis</div>
                            <div className="card table-card">
                                <div className="table-wrapper">
                                    <table className="perf-table">
                                        <thead>
                                            <tr>
                                                <th>Category</th>
                                                <th>Satisfaction %</th>
                                                <th>Status</th>
                                                <th>Satisfied</th>
                                                <th>Neutral</th>
                                                <th>Unsatisfied</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {metrics.categoryMetrics.map(cat => {
                                                const badge = getStatusBadge(cat.status);
                                                return (
                                                    <tr key={cat.key}>
                                                        <td>
                                                            <div className="cat-cell">
                                                                <span className="cat-name">{cat.label}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="pct-cell">
                                                                <span className="pct-value" style={{ color: getBarColor(cat.satisfactionPct) }}>
                                                                    {cat.satisfactionPct}%
                                                                </span>
                                                                <div className="mini-bar-track">
                                                                    <div
                                                                        className="mini-bar-fill"
                                                                        style={{
                                                                            width: `${cat.satisfactionPct}%`,
                                                                            background: getBarColor(cat.satisfactionPct)
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${badge.cls}`}>
                                                                {badge.icon} {cat.status}
                                                            </span>
                                                        </td>
                                                        <td><span className="count-cell satisfied">{cat.satisfied}</span></td>
                                                        <td><span className="count-cell neutral">{cat.neutral}</span></td>
                                                        <td><span className="count-cell unsatisfied">{cat.unsatisfied}</span></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Key Insights */}
                        <section className="dashboard-section">
                            <div className="section-label">Key Insights & Recommendations</div>
                            <div className="insights-grid">
                                {strengths.length > 0 && (
                                    <div className="card insight-card insight-strength">
                                        <div className="insight-header">
                                            <span className="insight-icon">✓</span>
                                            <h3>Strengths</h3>
                                        </div>
                                        <ul className="insight-list">
                                            {strengths.map((s, i) => (
                                                <li key={i}>{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {improvements.length > 0 && (
                                    <div className="card insight-card insight-improve">
                                        <div className="insight-header">
                                            <span className="insight-icon">⚠</span>
                                            <h3>Areas for Improvement</h3>
                                        </div>
                                        <ul className="insight-list">
                                            {improvements.map((s, i) => (
                                                <li key={i}>{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="card insight-card insight-overall">
                                    <div className="insight-header">
                                        <span className="insight-icon">○</span>
                                        <h3>Overall Assessment</h3>
                                    </div>
                                    <p className="insight-text">{overallAssessment}</p>
                                    <div className="overall-stats">
                                        <div className="overall-stat">
                                            <span className="stat-label">Avg Rating (0-10)</span>
                                            <span className="stat-val neutral">
                                                {metrics.avgGlobalScore}
                                            </span>
                                        </div>
                                        <div className="overall-stat">
                                            <span className="stat-label">Net Promoter Score</span>
                                            <span className={`stat-val ${metrics.npsScore > 0 ? 'satisfied' : 'unsatisfied'}`}>
                                                {metrics.npsScore > 0 ? '+' : ''}{metrics.npsScore}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
