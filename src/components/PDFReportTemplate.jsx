import React, { forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import './PDFReport.css';

const PDFReportTemplate = forwardRef(({ data, month, year, chartData }, ref) => {
    if (!data) return null;

    const {
        npsScore,
        total,
        overallSatisfactionPct,
        avgGlobalScore,
        categoryMetrics
    } = data;

    const strengths = categoryMetrics
        .filter(c => c.satisfactionPct >= 80)
        .sort((a, b) => b.satisfactionPct - a.satisfactionPct);

    const improvements = categoryMetrics
        .filter(c => c.satisfactionPct < 60)
        .sort((a, b) => a.satisfactionPct - b.satisfactionPct);

    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthName = MONTHS[month - 1];

    const getBarColor = (pct) => {
        if (pct >= 80) return '#2E9E6B';
        if (pct >= 60) return '#F1C40F';
        return '#C0392B';
    };

    return (
        <div className="pdf-container" ref={ref}>
            {/* Header */}
            <div className="pdf-header">
                <div className="pdf-header-left">
                    <h1>NPS Performance Report</h1>
                    <p>{monthName} {year}</p>
                </div>
                <div className="pdf-header-right">
                    <div className="pdf-meta">Generated: {new Date().toLocaleDateString()}</div>
                    <div className="pdf-meta">Confidential</div>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="pdf-section">
                <h2 className="pdf-section-title">Executive Summary</h2>
                <div className="pdf-metrics-grid">
                    <div className="pdf-metric-card">
                        <div className="pdf-metric-value highlight">{npsScore}</div>
                        <div className="pdf-metric-label">Net Promoter Score</div>
                    </div>
                    <div className="pdf-metric-card">
                        <div className="pdf-metric-value">{overallSatisfactionPct}%</div>
                        <div className="pdf-metric-label">Satisfaction Rate</div>
                    </div>
                    <div className="pdf-metric-card">
                        <div className="pdf-metric-value">{avgGlobalScore}</div>
                        <div className="pdf-metric-label">Avg Rating (0-10)</div>
                    </div>
                    <div className="pdf-metric-card">
                        <div className="pdf-metric-value">{total}</div>
                        <div className="pdf-metric-label">Total Responses</div>
                    </div>
                </div>
            </div>

            {/* Chart Analysis */}
            <div className="pdf-section">
                <h2 className="pdf-section-title">Category Performance Analysis</h2>
                <div className="pdf-chart-container">
                    {chartData && chartData.length > 0 && (
                        <BarChart
                            width={700}
                            height={260}
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#666' }}
                                axisLine={{ stroke: '#ddd' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={v => `${v}%`}
                                domain={[0, 100]}
                            />
                            <Bar dataKey="satisfaction" barSize={40}>
                                {chartData.map((entry, index) => (
                                    <Cell key={index} fill={getBarColor(entry.satisfaction)} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </div>
            </div>

            {/* Key Insights */}
            <div className="pdf-section">
                <h2 className="pdf-section-title">Key Insights & Recommendations</h2>
                <div className="pdf-insights-container">
                    <div className="pdf-insight-box strength">
                        <div className="pdf-insight-title" style={{ color: '#2E9E6B' }}>
                            <span>✓</span> Areas of Strength
                        </div>
                        <ul className="pdf-insight-list">
                            {strengths.length > 0 ? strengths.map((s, i) => (
                                <li key={i}>
                                    <strong>{s.label}</strong> achieved a strong satisfaction rate of {s.satisfactionPct}%, contributing positively to the overall NPS.
                                </li>
                            )) : (
                                <li>No clear strengths identified above 80% satisfaction this month.</li>
                            )}
                        </ul>
                    </div>

                    <div className="pdf-insight-box improvement">
                        <div className="pdf-insight-title" style={{ color: '#C0392B' }}>
                            <span>⚠</span> Areas for Improvement
                        </div>
                        <ul className="pdf-insight-list">
                            {improvements.length > 0 ? improvements.map((s, i) => (
                                <li key={i}>
                                    <strong>{s.label}</strong> is lagging at {s.satisfactionPct}%. Improvements in this area should be prioritized to boost customer loyalty.
                                </li>
                            )) : (
                                <li>No critical areas (below 60%) identified this month. Keep up the good work!</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pdf-footer">
                <div>NPS Dashboard Report</div>
                <div>Page 1 of 1</div>
            </div>
        </div>
    );
});

export default PDFReportTemplate;
