/**
 * Pure sort helper extracted from BaseRepository.
 * No this-context required — safe to call from anywhere.
 */

/**
 * Sort an array of plain objects by a field.
 * Date fields are detected by name containing "date" or "At".
 *
 * @param {Object[]} data
 * @param {string} sortBy  - field name
 * @param {'asc'|'desc'} sortOrder
 * @returns {Object[]} new sorted array (mutates-in-place via Array#sort, then returns)
 */
export function sortData(data, sortBy, sortOrder = 'desc') {
  return data.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy.includes('date') || sortBy.includes('At')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
  });
}
