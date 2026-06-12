import React, { useState, useMemo } from 'react';
import { faArrowLeft, faFilter } from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';
import BudgetOverviewCard from './budget-detail/BudgetOverviewCard';
import TransactionAnalysis from './budget-detail/TransactionAnalysis';
import TransactionFilters from './budget-detail/TransactionFilters';
import TransactionTable from './budget-detail/TransactionTable';
import { useTransactionFilters } from './budget-detail/useTransactionFilters';
import { useTransactions } from '../../../controller/hooks/useTransactions';
import { getBudgetStatusInfo } from './budget-list/budgetStatusInfo';

const BudgetDetail = ({
  budget,
  onBack = () => {},
  onEditBudget = () => {},
  onDeleteBudget = () => {},
  className = ''
}) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, isDeleting: false });
  const { transactions } = useTransactions();

  const budgetTransactions = useMemo(() => {
    if (!budget || !transactions) return [];
    return transactions.filter(transaction => {
      const transactionCategory = transaction.category || transaction.categoryName || '';
      const matchesCategory = transactionCategory.toLowerCase() === (budget.category || '').toLowerCase();
      if (budget.startDate && budget.endDate) {
        const transactionDate = new Date(transaction.date);
        const withinDateRange = transactionDate >= new Date(budget.startDate) && transactionDate <= new Date(budget.endDate);
        return matchesCategory && withinDateRange;
      }
      return matchesCategory;
    });
  }, [budget, transactions]);

  const transactionStats = useMemo(() => {
    const expenses = budgetTransactions.filter(t => t.type === 'expense');
    const income = budgetTransactions.filter(t => t.type === 'income');
    const totalExpenses = expenses.reduce((sum, t) => sum + (Math.abs(t.amount) || 0), 0);
    const totalIncome = income.reduce((sum, t) => sum + (Math.abs(t.amount) || 0), 0);
    return {
      totalTransactions: budgetTransactions.length,
      expenseCount: expenses.length,
      incomeCount: income.length,
      totalExpenses,
      totalIncome,
      netAmount: totalIncome - totalExpenses,
      averageTransaction: expenses.length > 0 ? totalExpenses / expenses.length : 0
    };
  }, [budgetTransactions]);

  const {
    searchTerm, setSearchTerm,
    selectedType, setSelectedType,
    sortField, setSortField,
    sortDirection, setSortDirection,
    showFilters, setShowFilters,
    filteredAndSortedTransactions,
    handleSort,
    getSortIcon,
    clearFilters
  } = useTransactionFilters(budgetTransactions);

  const handleDeleteClick = () => {
    setDeleteModal({ isOpen: true, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await onDeleteBudget(budget.id);
      onBack();
    } catch (error) {
      console.error('Error deleting budget:', error);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, isDeleting: false });
  };

  if (!budget) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <p className="text-gray-500">No budget selected</p>
        </div>
      </Card>
    );
  }

  const statusInfo = getBudgetStatusInfo(budget);
  const percentage = budget.utilizationPercentage || 0;
  const spent = budget.progress?.spent || transactionStats.totalExpenses;
  const remaining = budget.progress?.remaining || (budget.budgetAmount - spent);
  const budgetAmount = budget.budgetAmount || 0;

  return (
    <div className={className}>
      <div className="mb-4">
        <Button variant="outline" onClick={onBack} icon={faArrowLeft} className="bg-white shadow-sm">
          Back to Budget List
        </Button>
      </div>

      <BudgetOverviewCard
        budget={budget}
        statusInfo={statusInfo}
        spent={spent}
        remaining={remaining}
        budgetAmount={budgetAmount}
        percentage={percentage}
        onEditBudget={onEditBudget}
        onDeleteClick={handleDeleteClick}
      />

      <TransactionAnalysis transactionStats={transactionStats} />

      <Card
        title={`Transactions in ${budget.category} (${filteredAndSortedTransactions.length})`}
        headerAction={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={faFilter}
              className={showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
            >
              Filters
            </Button>
          </div>
        }
      >
        <div className="p-6 space-y-6">
          <TransactionFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            sortField={sortField}
            setSortField={setSortField}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            showFilters={showFilters}
          />
          <TransactionTable
            filteredAndSortedTransactions={filteredAndSortedTransactions}
            budgetTransactions={budgetTransactions}
            budgetCategory={budget.category}
            handleSort={handleSort}
            getSortIcon={getSortIcon}
            onClearFilters={clearFilters}
          />
        </div>
      </Card>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message={`Are you sure you want to delete the "${budget?.category}" budget? This action cannot be undone and will permanently remove all budget data and transaction associations.`}
        confirmText="Delete Budget"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default BudgetDetail;
