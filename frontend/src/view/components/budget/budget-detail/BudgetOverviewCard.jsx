import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faCalendarAlt, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import { formatCurrency, formatPercentage, formatDate } from '../../../../controller/utils/formatters';

const BudgetOverviewCard = ({ budget, statusInfo, spent, remaining, budgetAmount, percentage, onEditBudget, onDeleteClick }) => (
  <Card
    className="mb-6"
    headerAction={
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={() => onEditBudget(budget)} icon={faEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDeleteClick} icon={faTrash} className="text-red-600 hover:text-red-700">
          Delete
        </Button>
      </div>
    }
  >
    <div className="p-6">
      {/* Title row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
            <FontAwesomeIcon icon={statusInfo.icon} className={`w-6 h-6 ${statusInfo.textColor}`} />
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {budget.category} Budget
              </h1>
              <span className={`px-3 py-1 text-sm rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                {statusInfo.text}
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4" />
                <span>{formatCurrency(budgetAmount)} budget</span>
              </div>
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                <span>{budget.period}</span>
              </div>
              {budget.startDate && (
                <div className="flex items-center space-x-1">
                  <span>
                    {formatDate(budget.startDate)} - {budget.endDate ? formatDate(budget.endDate) : 'Ongoing'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
          <span className="text-lg font-semibold text-gray-900">{formatPercentage(percentage)}</span>
        </div>
        <ProgressBar value={percentage} max={100} color="dynamic" size="lg" animated={true} />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{formatCurrency(spent)} spent</span>
          <span>{formatCurrency(budgetAmount)} total budget</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">Total Budget</div>
          <div className="text-xl font-bold text-blue-600">{formatCurrency(budgetAmount)}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-red-600 mb-1">Spent</div>
          <div className="text-xl font-bold text-red-600">{formatCurrency(spent)}</div>
        </div>
        <div className={`p-4 rounded-lg ${remaining >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm mb-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {remaining >= 0 ? 'Remaining' : 'Over Budget'}
          </div>
          <div className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(remaining))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Alert Threshold</div>
          <div className="text-xl font-bold text-gray-600">{budget.alertThreshold || 80}%</div>
        </div>
      </div>

      {budget.description && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
          <p className="text-gray-700">{budget.description}</p>
        </div>
      )}
    </div>
  </Card>
);

export default BudgetOverviewCard;
