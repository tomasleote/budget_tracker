import React from 'react';
import Card from '../../ui/Card';
import { formatCurrency } from '../../../../controller/utils/formatters';

const TransactionAnalysis = ({ transactionStats }) => (
  <Card title="Transaction Analysis" className="mb-6">
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {transactionStats.totalTransactions}
          </div>
          <div className="text-sm text-gray-600">Total Transactions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {transactionStats.expenseCount}
          </div>
          <div className="text-sm text-gray-600">Expenses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {transactionStats.incomeCount}
          </div>
          <div className="text-sm text-gray-600">Income</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(transactionStats.averageTransaction)}
          </div>
          <div className="text-sm text-gray-600">Avg. Expense</div>
        </div>
      </div>
    </div>
  </Card>
);

export default TransactionAnalysis;
