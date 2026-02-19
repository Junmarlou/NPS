import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import PDFReportTemplate from './PDFReportTemplate';

export default function ExportPDFButton({ data, month, year, chartData, fileName = 'report.pdf' }) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (!data) return;

        try {
            setLoading(true);

            // Create a temporary container
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-9999px';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            // Render the PDF template into the container
            const root = createRoot(container);

            // We need to wait for render. 
            // A simple way is to wrap the process in a promise that resolves after a timeout
            // to allow React to flush changes.
            await new Promise((resolve) => {
                root.render(
                    <PDFReportTemplate
                        data={data}
                        month={month}
                        year={year}
                        chartData={chartData}
                    />
                );
                // Give it some time to render charts etc
                setTimeout(resolve, 1000);
            });

            // The container currently has the React app root. 
            // We need to capture the child (the PDF template div)
            const element = container.firstElementChild;

            if (!element) throw new Error('Render failed');

            // Capture with html2canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // PDF setup (A4)
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // We scaled the capture, so we fit it to A4 width
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // If height > A4, add pages (simplified, assuming template fits or we just cut it for now)
            // Ideally the template is designed to fit one page or we implement multi-page logic
            // The template CSS has min-height: 297mm so it should be at least one A4 page.

            // Save
            pdf.save(fileName);

            // Cleanup
            root.unmount();
            document.body.removeChild(container);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="btn btn-gold"
            onClick={handleExport}
            disabled={loading || !data}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
            {loading ? (
                <>
                    <span className="spinner">⌛</span> Generating Report...
                </>
            ) : (
                <>
                    <span>📥</span> Export Report (PDF)
                </>
            )}
        </button>
    );
}
