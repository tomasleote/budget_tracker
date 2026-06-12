/**
 * Core CSV primitives: serialization, download, and validation helpers
 */

/**
 * @param {Array} data
 * @param {Array|null} headers
 * @returns {string} CSV string
 */
export const arrayToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';

  const csvHeaders = headers || Object.keys(data[0]);
  const headerRow = csvHeaders.map(h => `"${h}"`).join(',');

  const dataRows = data.map(row =>
    csvHeaders.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
};

/**
 * @param {string} csvContent
 * @param {string} filename
 */
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * @param {number} amount
 * @returns {number}
 */
export const formatCurrencyForCSV = (amount) => (typeof amount === 'number' ? amount : 0);

/**
 * @param {Array} data
 * @param {string} type
 * @returns {boolean}
 */
export const validateExportData = (data, type) => {
  if (!data || !Array.isArray(data)) throw new Error(`Invalid ${type} data: must be an array`);
  if (data.length === 0) throw new Error(`No ${type} data to export`);
  return true;
};
