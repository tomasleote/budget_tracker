import { getNestedValue } from './objectHelpers.js';

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = getNestedValue(item, key);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = getNestedValue(a, key);
    const bValue = getNestedValue(b, key);

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = (array, key = null) => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = getNestedValue(item, key);
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
};

export const sumBy = (array, key) => {
  return array.reduce((sum, item) => {
    const value = getNestedValue(item, key);
    return sum + (parseFloat(value) || 0);
  }, 0);
};

export const countBy = (array, key) => {
  return array.reduce((counts, item) => {
    const value = getNestedValue(item, key);
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const flatten = (array, depth = 1) => {
  return depth > 0
    ? array.reduce((acc, val) =>
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : array.slice();
};
