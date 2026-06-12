import React from 'react';
import Card from '../../components/ui/Card';
import {
  TransactionList,
  TransactionGrid,
  TransactionFilterToolbar
} from '../../components/transactions';

const LoadingSkeleton = () => (
  <Card>
    <div className="p-6">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4">
            <div className="w-10 h-10 bg-theme-tertiary rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-theme-tertiary rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-theme-tertiary rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-theme-tertiary rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const TransactionContent = ({
  localFilters,
  onFiltersChange,
  categories,
  filteredTransactions,
  viewMode,
  onViewModeChange,
  isLoading,
  isUpdatingTransaction,
  isDeletingTransaction,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onBulkDelete
}) => (
  <div className="space-y-6">
    <TransactionFilterToolbar
      filters={localFilters}
      onFiltersChange={onFiltersChange}
      onResetFilters={() => onFiltersChange({ type: 'all', dateFrom: '', dateTo: '', search: '' })}
      categories={categories}
      totalTransactions={filteredTransactions.length}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      showSearch={false}
      hasAdvancedFilters={
        localFilters.type !== 'all' ||
        localFilters.dateFrom ||
        localFilters.dateTo ||
        localFilters.search ||
        (localFilters.category && localFilters.category !== 'all')
      }
    />

    {isLoading ? (
      <LoadingSkeleton />
    ) : viewMode === 'list' ? (
      <TransactionList
        transactions={filteredTransactions}
        onTransactionSelect={onViewTransaction}
        onTransactionEdit={onEditTransaction}
        onTransactionDelete={onDeleteTransaction}
        onBulkDelete={onBulkDelete}
        isLoading={isLoading}
        isUpdating={isUpdatingTransaction}
        isDeleting={isDeletingTransaction}
        parentFilters={localFilters}
        onFiltersChange={(tableFilters) => onFiltersChange(prev => ({ ...prev, ...tableFilters }))}
      />
    ) : (
      <TransactionGrid
        transactions={filteredTransactions}
        onTransactionSelect={onViewTransaction}
        onTransactionEdit={onEditTransaction}
        onTransactionDelete={onDeleteTransaction}
        isLoading={isLoading}
        isUpdating={isUpdatingTransaction}
        isDeleting={isDeletingTransaction}
        parentFilters={localFilters}
        onFiltersChange={(tableFilters) => onFiltersChange(prev => ({ ...prev, ...tableFilters }))}
      />
    )}
  </div>
);

export default TransactionContent;
