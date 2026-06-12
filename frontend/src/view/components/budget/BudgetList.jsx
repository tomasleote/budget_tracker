import React, { useState } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';
import BudgetListSkeleton from './budget-list/BudgetListSkeleton';
import BudgetListEmpty from './budget-list/BudgetListEmpty';
import BudgetListFilters from './budget-list/BudgetListFilters';
import BudgetSummaryStats from './budget-list/BudgetSummaryStats';
import BudgetListItem from './budget-list/BudgetListItem';
import BudgetNoResults from './budget-list/BudgetNoResults';
import { useBudgetListFilters } from './budget-list/useBudgetListFilters';

const BudgetList = ({
  budgets = [],
  isLoading = false,
  onCreateBudget = () => {},
  onEditBudget = () => {},
  onDeleteBudget = () => {},
  onViewBudget = () => {},
  showActions = true,
  className = ''
}) => {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    budget: null,
    isDeleting: false
  });

  const {
    searchTerm, setSearchTerm,
    selectedStatus, setSelectedStatus,
    selectedPeriod, setSelectedPeriod,
    sortField, setSortField,
    showFilters, setShowFilters,
    filteredAndSortedBudgets,
    clearFilters
  } = useBudgetListFilters(budgets);

  const handleDeleteClick = (budget) => {
    setDeleteModal({ isOpen: true, budget, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.budget) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await onDeleteBudget(deleteModal.budget.id);
      setDeleteModal({ isOpen: false, budget: null, isDeleting: false });
    } catch (error) {
      console.error('Error deleting budget:', error);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, budget: null, isDeleting: false });
  };

  if (isLoading) {
    return <BudgetListSkeleton className={className} />;
  }

  if (!budgets || budgets.length === 0) {
    return <BudgetListEmpty className={className} onCreateBudget={onCreateBudget} />;
  }

  return (
    <>
      <Card
        className={className}
        title="Budget Management"
        headerAction={showActions ? (
          <Button variant="primary" onClick={onCreateBudget} icon={faPlus}>
            New Budget
          </Button>
        ) : null}
      >
        <div className="space-y-6">
          <BudgetListFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            sortField={sortField}
            setSortField={setSortField}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          <BudgetSummaryStats budgets={budgets} />

          <div className="space-y-4 max-h-[40rem] overflow-y-auto pr-2">
            {filteredAndSortedBudgets.map((budget) => (
              <BudgetListItem
                key={budget.id}
                budget={budget}
                showActions={showActions}
                onViewBudget={onViewBudget}
                onEditBudget={onEditBudget}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>

          {filteredAndSortedBudgets.length === 0 && budgets.length > 0 && (
            <BudgetNoResults
              onClearFilters={clearFilters}
              onCreateBudget={onCreateBudget}
            />
          )}
        </div>
      </Card>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message={`Are you sure you want to delete the "${deleteModal.budget?.category}" budget? This action cannot be undone and will permanently remove all budget data.`}
        confirmText="Delete Budget"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteModal.isDeleting}
      />
    </>
  );
};

export default BudgetList;
