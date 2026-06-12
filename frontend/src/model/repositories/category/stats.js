/**
 * Pure aggregation helpers for CategoryRepository analytics methods.
 */
export function computeStats(categories) {
  const stats = {
    total: categories.length,
    active: 0,
    inactive: 0,
    income: 0,
    expense: 0,
    default: 0,
    custom: 0,
    parents: 0,
    children: 0
  };

  categories.forEach(category => {
    if (category.isActive) {
      stats.active++;
    } else {
      stats.inactive++;
    }

    if (category.type === 'income') {
      stats.income++;
    } else {
      stats.expense++;
    }

    if (category.isDefault) {
      stats.default++;
    } else {
      stats.custom++;
    }

    if (category.parentId === null) {
      stats.parents++;
    } else {
      stats.children++;
    }
  });

  return stats;
}

export function computeColorDistribution(categories) {
  const colorCounts = {};
  categories.forEach(category => {
    const color = category.color;
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });
  return Object.entries(colorCounts)
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count);
}

export function computeIconDistribution(categories) {
  const iconCounts = {};
  categories.forEach(category => {
    const icon = category.icon;
    iconCounts[icon] = (iconCounts[icon] || 0) + 1;
  });
  return Object.entries(iconCounts)
    .map(([icon, count]) => ({ icon, count }))
    .sort((a, b) => b.count - a.count);
}
