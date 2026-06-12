import React, { useState } from 'react';
import Card from '../components/ui/Card';

import {
  BudgetFormModal,
  BudgetProgress,
  BudgetAlerts,
  BudgetList,
  BudgetDetail
} from '../components/budget';

import { useBudgets } from '../../controller/hooks/useBudgets';
import { useCategories } from '../../controller/hooks/useCategories';

import BudgetHeader from './budget/BudgetHeader';
import BudgetSummaryCards from './budget/BudgetSummaryCards';
import BudgetTabBar from './budget/BudgetTabBar';
import BudgetAnalyticsCard from './budget/BudgetAnalyticsCard';

const Budget = () => {
  const [viewMode, setViewMode] = useState('overview');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [viewingBudget, setViewingBudget] = useState(null);

  const {
    budgets,
    overview,
    alerts,
    analytics,
    isLoading,
    hasError,
    createBudget,
    updateBudget,
    deleteBudget,
    dismissAlert,
    getBudgetStatistics,
    hasAlerts
  } = useBudgets();

  const { categories } = useCategories();

  const stats = getBudgetStatistics();

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setShowBudgetModal(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowBudgetModal(true);
  };

  const handleViewBudget = (budget) => {
    setViewingBudget(budget);
  };

  const handleBackToBudgetList = () => {
    setViewingBudget(null);
  };

  const handleDeleteBudget = async (budgetId) => {
    await deleteBudget(budgetId);
  };

  const handleBudgetSaved = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleModalClose = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleAlertClick = (alert) => {
    if (alert.budgetId || alert.category) {
      const budget = budgets.find(b =>
        b.id === alert.budgetId ||
        b.category === alert.category ||
        b.category === alert.categoryName
      );
      if (budget) setViewingBudget(budget);
    }
  };

  const handleViewBudgetFromAlert = (budgetIdOrCategory) => {
    const budget = budgets.find(b =>
      b.id === budgetIdOrCategory ||
      b.category === budgetIdOrCategory ||
      b.category?.toLowerCase() === budgetIdOrCategory?.toLowerCase()
    );
    if (budget) {
      setViewingBudget(budget);
    } else {
      setViewMode('list');
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await dismissAlert(alertId);
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <BudgetHeader hasAlerts={hasAlerts} alertCount={alerts.length} />

        <BudgetSummaryCards stats={stats} />

        <BudgetTabBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          alertCount={alerts.length}
          viewingBudget={viewingBudget}
          onClearViewingBudget={() => setViewingBudget(null)}
        />

        <div className="space-y-6">
          {viewingBudget ? (
            <BudgetDetail
              budget={viewingBudget}
              onBack={handleBackToBudgetList}
              onEditBudget={handleEditBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          ) : (
            <>
              {viewMode === 'overview' && (
                <div className="space-y-6">
                  <BudgetProgress
                    budgetOverview={overview}
                    isLoading={isLoading}
                    onBudgetClick={() => {}}
                    onCreateBudget={handleCreateBudget}
                    showCreateButton={true}
                  />
                  <BudgetAnalyticsCard analytics={analytics} />
                </div>
              )}

              {viewMode === 'list' && (
                <BudgetList
                  budgets={budgets}
                  isLoading={isLoading}
                  onCreateBudget={handleCreateBudget}
                  onEditBudget={handleEditBudget}
                  onDeleteBudget={handleDeleteBudget}
                  onViewBudget={handleViewBudget}
                  showActions={true}
                />
              )}

              {viewMode === 'alerts' && (
                <BudgetAlerts
                  alerts={alerts}
                  isLoading={isLoading}
                  onAlertClick={handleAlertClick}
                  onDismissAlert={handleDismissAlert}
                  onViewBudget={handleViewBudgetFromAlert}
                />
              )}
            </>
          )}
        </div>

        <BudgetFormModal
          isOpen={showBudgetModal}
          onClose={handleModalClose}
          budget={editingBudget}
          onBudgetSaved={handleBudgetSaved}
        />

        {hasError && (
          <Card className="mt-6">
            <div className="p-4 rounded-lg" style={{
              backgroundColor: 'var(--error-bg)',
              borderColor: 'var(--error-border)',
              borderWidth: '1px'
            }}>
              <p style={{ color: 'var(--error)' }}>
                Error loading budgets. Please try refreshing the page.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Budget;
