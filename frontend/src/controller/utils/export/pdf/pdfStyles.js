/**
 * Inline CSS for PDF print window
 */
export const PDF_STYLES = `
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 20px;
    color: #333;
  }
  .header {
    text-align: center;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .header h1 {
    color: #2563eb;
    margin: 0;
    font-size: 28px;
  }
  .header .subtitle {
    color: #666;
    margin: 5px 0;
    font-size: 14px;
  }
  .section {
    margin: 30px 0;
    page-break-inside: avoid;
  }
  .section h2 {
    color: #1f2937;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 5px;
    margin-bottom: 15px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
  }
  .summary-card {
    background: #f9fafb;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #2563eb;
  }
  .summary-card .label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .summary-card .value {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
  }
  .summary-card .value.positive {
    color: #059669;
  }
  .summary-card .value.negative {
    color: #dc2626;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 12px;
  }
  th, td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  th {
    background: #f3f4f6;
    font-weight: 600;
    color: #374151;
  }
  tr:nth-child(even) {
    background: #f9fafb;
  }
  .text-right {
    text-align: right;
  }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    font-size: 12px;
    color: #6b7280;
  }
  @media print {
    body { margin: 0; }
    .no-print { display: none; }
    .section { page-break-inside: avoid; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
  }
`;
