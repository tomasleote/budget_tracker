import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import Button from '../../ui/Button';
import { formatCurrency, formatDate } from '../../../../controller/utils/formatters';

const TransactionTable = ({
  filteredAndSortedTransactions,
  budgetTransactions,
  budgetCategory,
  handleSort,
  getSortIcon,
  onClearFilters
}) => {
  if (filteredAndSortedTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <FontAwesomeIcon icon={faReceipt} className="text-gray-400 text-4xl mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
        <p className="text-gray-500">
          {budgetTransactions.length === 0
            ? `No transactions found for the ${budgetCategory} category.`
            : 'No transactions match your current search and filter criteria.'
          }
        </p>
        {budgetTransactions.length > 0 && (
          <Button variant="outline" onClick={onClearFilters} className="mt-4">
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <FontAwesomeIcon icon={getSortIcon('date')} className="w-3 h-3" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center space-x-1">
                  <span>Description</span>
                  <FontAwesomeIcon icon={getSortIcon('description')} className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Amount</span>
                  <FontAwesomeIcon icon={getSortIcon('amount')} className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon
                      icon={transaction.type === 'income' ? faPlus : faMinus}
                      className={`w-3 h-3 ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}
                    />
                    <span>{transaction.description || 'No description'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
