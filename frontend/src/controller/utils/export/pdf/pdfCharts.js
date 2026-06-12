/**
 * SVG chart generators for PDF reports
 */

/**
 * @param {Array} categoryData
 * @param {number} totalAmount
 * @returns {string} SVG + legend HTML
 */
export const generatePieChartSVG = (categoryData, totalAmount) => {
  if (!categoryData || categoryData.length === 0) return '';

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#059669', '#DC2626', '#7C3AED'];
  const size = 200;
  const radius = 80;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = 0;
  const paths = [];
  const legends = [];

  categoryData.slice(0, 8).forEach((category, index) => {
    const percentage = (category.amount / totalAmount) * 100;
    const angle = (percentage / 100) * 2 * Math.PI;

    if (percentage < 1) return;

    const startX = centerX + radius * Math.cos(currentAngle);
    const startY = centerY + radius * Math.sin(currentAngle);
    const endX = centerX + radius * Math.cos(currentAngle + angle);
    const endY = centerY + radius * Math.sin(currentAngle + angle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');

    const color = colors[index % colors.length];
    paths.push(`<path d="${pathData}" fill="${color}" stroke="white" stroke-width="1"/>`);

    legends.push(`
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <div style="width: 12px; height: 12px; background: ${color}; margin-right: 6px; border-radius: 2px;"></div>
        <span style="font-size: 11px; color: #374151;">${category.category}: ${percentage.toFixed(1)}%</span>
      </div>
    `);

    currentAngle += angle;
  });

  return `
    <div style="display: flex; align-items: center; gap: 20px; margin: 20px 0;">
      <svg width="${size}" height="${size}" style="flex-shrink: 0;">
        ${paths.join('')}
      </svg>
      <div style="flex: 1;">
        <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; color: #1f2937;">Category Breakdown</h4>
        ${legends.join('')}
      </div>
    </div>
  `;
};

/**
 * @param {Array} budgetData
 * @returns {string} SVG bar chart HTML
 */
export const generateBudgetBarChartSVG = (budgetData) => {
  if (!budgetData || budgetData.length === 0) return '';

  const chartWidth = 400;
  const barHeight = 16;
  const spacing = 4;
  const maxBars = 8;

  const visibleBudgets = budgetData.slice(0, maxBars);
  const totalHeight = visibleBudgets.length * (barHeight + spacing) - spacing;

  const bars = visibleBudgets.map((budget, index) => {
    const utilization = Math.min(budget.utilizationPercentage || 0, 150);
    const barWidth = (utilization / 150) * (chartWidth - 100);
    const y = index * (barHeight + spacing);

    let color = '#10B981';
    if (utilization > 100) color = '#EF4444';
    else if (utilization >= 80) color = '#F59E0B';

    return `
      <g>
        <rect x="0" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="2"/>
        <text x="${barWidth + 5}" y="${y + barHeight / 2 + 3}" font-size="10" fill="#374151">${utilization.toFixed(0)}%</text>
        <text x="-5" y="${y + barHeight / 2 + 3}" font-size="9" fill="#6B7280" text-anchor="end">${budget.category}</text>
      </g>
    `;
  });

  return `
    <div style="margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; color: #1f2937;">Budget Utilization</h4>
      <svg width="${chartWidth}" height="${totalHeight + 20}" style="overflow: visible;">
        <g transform="translate(80, 10)">
          ${bars.join('')}
        </g>
      </svg>
      <div style="font-size: 9px; color: #6B7280; margin-top: 5px;">
        <span style="color: #10B981;">&#9632;</span> Healthy (&lt;80%) &nbsp;
        <span style="color: #F59E0B;">&#9632;</span> Near Limit (80-100%) &nbsp;
        <span style="color: #EF4444;">&#9632;</span> Exceeded (&gt;100%)
      </div>
    </div>
  `;
};
