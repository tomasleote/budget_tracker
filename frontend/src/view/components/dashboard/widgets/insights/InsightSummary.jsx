import React from 'react';

const InsightSummary = ({ insights }) => (
  <div className="pt-4 border-t border-gray-200">
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-lg font-semibold text-red-600">
          {insights.filter(i => i.priority === 'high').length}
        </div>
        <div className="text-xs text-gray-500">High Priority</div>
      </div>
      <div>
        <div className="text-lg font-semibold text-yellow-600">
          {insights.filter(i => i.priority === 'medium').length}
        </div>
        <div className="text-xs text-gray-500">Medium</div>
      </div>
      <div>
        <div className="text-lg font-semibold text-green-600">
          {insights.filter(i => i.type === 'success').length}
        </div>
        <div className="text-xs text-gray-500">Positive</div>
      </div>
    </div>
  </div>
);

export default InsightSummary;
