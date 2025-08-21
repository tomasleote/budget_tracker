import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet,
  faPlus,
  faFilter,
  faDownload,
  faSearch,
  faChartLine,
  faExclamationTriangle,
  faCheckCircle,
  faList,
  faTh,
  faSpinner,
  faEdit,
  faTrash,
  faEye,
  faBell,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Budget components
import {
  BudgetForm,
  BudgetFormModal,
  BudgetProgress,
  BudgetAlerts,
  BudgetList,
  BudgetDetail
} from '../components/budget';

// Hooks
import { useBudgets } from '../../controller/hooks/useBudgets';
import { useCategories } from '../../controller/hooks/useCategories';

// Developer utilities
import { loadMockDataToStorage, clearMockData } from '../../data/mockDataGenerator.js';

const Budget = () => {
  // State management
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'list', 'alerts'
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewingBudget, setViewingBudget] = useState(null); // For budget detail view

  // Hooks
  const {
    budgets,
    overview,
    alerts,
    analytics,
    isLoading,
    isCreatingBudget,
    isUpdatingBudget,
    isDeletingBudget,
    hasError,
    createBudget,
    updateBudget,
    deleteBudget,
    dismissAlert,
    getBudgetStatistics,
    hasAlerts,
    highPriorityAlerts,
    getExceededBudgets,
    getNearLimitBudgets,
    getHealthyBudgets
  } = useBudgets();

  const { categories } = useCategories();

  // Get budget statistics
  const stats = getBudgetStatistics();
  const exceededBudgets = getExceededBudgets();
  const nearLimitBudgets = getNearLimitBudgets();
  const healthyBudgets = getHealthyBudgets();

  // Handle budget operations
  const handleCreateBudget = () => {
    setEditingBudget(null);
    setShowBudgetModal(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowBudgetModal(true);
  };

  const handleViewBudget = (budget) => {
    console.log('View budget details:', budget);
    setViewingBudget(budget);
  };

  const handleBackToBudgetList = () => {
    setViewingBudget(null);
  };

  const handleDeleteBudget = async (budgetId) => {
    await deleteBudget(budgetId);
  };

  const handleBudgetSaved = (budget) => {
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleModalClose = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleBudgetClick = (budget) => {
    console.log('Budget clicked:', budget);
    // Could open detail view or edit modal
  };

  const handleAlertClick = (alert) => {
    console.log('Alert clicked:', alert);
    // For "Take Action" - navigate to the specific budget
    if (alert.budgetId || alert.category) {
      const budget = budgets.find(b => 
        b.id === alert.budgetId || 
        b.category === alert.category || 
        b.category === alert.categoryName
      );
      if (budget) {
        setViewingBudget(budget);
      }
    }
  };

  const handleViewBudgetFromAlert = (budgetIdOrCategory) => {
    console.log('View budget from alert:', budgetIdOrCategory);
    // Find the budget by ID or category name
    const budget = budgets.find(b => 
      b.id === budgetIdOrCategory || 
      b.category === budgetIdOrCategory || 
      b.category?.toLowerCase() === budgetIdOrCategory?.toLowerCase()
    );
    
    if (budget) {
      setViewingBudget(budget);
    } else {
      console.warn('Budget not found for:', budgetIdOrCategory);
      // Fallback: switch to manage tab to show all budgets
      setViewMode('list');
    }
  };

  const handleDismissAlert = async (alertId) => {
    console.log('Dismiss alert with ID:', alertId);
    try {
      const result = await dismissAlert(alertId);
      if (result.success) {
        console.log('Alert dismissed successfully');
      } else {
        console.error('Failed to dismiss alert:', result.error);
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  // No need for visibleAlerts filtering since alerts from the service already respect dismissals
  // const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  // Developer utility to completely reset all data
  const handleCompleteReset = async () => {
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('🧼 Performing complete reset...');
        
        // Clear all localStorage data
        clearMockData();
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Complete reset done! Refreshing page...');
        window.location.reload();
      } catch (error) {
        console.error('❌ Error during reset:', error);
        alert('Error during reset. Check console for details.');
      }
    }
  };

  // Developer utility to regenerate mock data with fixed dates
  const handleRegenerateMockData = async () => {
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('🔄 Regenerating mock data with fixed budget dates...');
        
        // First clear everything
        clearMockData();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Generate new data
        await loadMockDataToStorage(4);
        
        // Trigger custom events to refresh all providers
        console.log('🔄 Triggering data refresh events...');
        window.dispatchEvent(new CustomEvent('refreshTransactions'));
        window.dispatchEvent(new CustomEvent('refreshBudgets'));
        
        console.log('✅ Mock data regenerated! Data should refresh automatically.');
        
        // Force reload the current page data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('❌ Error regenerating mock data:', error);
        alert('Error regenerating mock data. Check console for details.');
      }
    }
  };

  // View mode buttons
  const viewModes = [
    { key: 'overview', label: 'Overview', icon: faChartLine },
    { key: 'list', label: 'Manage', icon: faList },
    { key: 'alerts', label: 'Alerts', icon: faBell, badge: alerts.length > 0 ? alerts.length : null }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <FontAwesomeIcon 
                  icon={faWallet} 
                  className="text-xl" 
                  style={{ color: 'var(--accent-primary)' }}
                />
                <h1 className="text-2xl lg:text-3xl font-bold" style={{
                  color: 'var(--text-primary)'
                }}>
                  Budget Management
                </h1>
                {hasAlerts && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                    backgroundColor: 'var(--error-bg)',
                    color: 'var(--error)'
                  }}>
                    {alerts.length} alerts
                  </span>
                )}
              </div>
              <p className="text-sm lg:text-base" style={{
                color: 'var(--text-secondary)'
              }}>
                Create and track budgets to stay on top of your spending
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Developer Tools - Only in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCompleteReset}
                    size="sm"
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    🧼 Reset All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRegenerateMockData}
                    icon={faRefresh}
                    size="sm"
                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    🎭 Regenerate Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const { default: BudgetService } = await import('../../model/services/BudgetService.js');
                      BudgetService.clearDismissedAlerts();
                      window.location.reload();
                    }}
                    size="sm"
                    className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                  >
                    🚨 Reset Alerts
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budget Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 lg:mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'var(--info-bg)'
              }}>
                <FontAwesomeIcon 
                  icon={faWallet} 
                  className="w-5 h-5" 
                  style={{ color: 'var(--info)' }}
                />
              </div>
              <div>
                <p className="text-sm font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>Total Budgets</p>
                <p className="text-2xl font-bold" style={{
                  color: 'var(--text-primary)'
                }}>{stats.totalBudgets}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'var(--success-bg)'
              }}>
                <FontAwesomeIcon 
                  icon={faCheckCircle} 
                  className="w-5 h-5" 
                  style={{ color: 'var(--success)' }}
                />
              </div>
              <div>
                <p className="text-sm font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>Healthy Budgets</p>
                <p className="text-2xl font-bold" style={{
                  color: 'var(--success)'
                }}>{stats.healthyBudgets}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'var(--warning-bg)'
              }}>
                <FontAwesomeIcon 
                  icon={faExclamationTriangle} 
                  className="w-5 h-5" 
                  style={{ color: 'var(--warning)' }}
                />
              </div>
              <div>
                <p className="text-sm font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>Near Limit</p>
                <p className="text-2xl font-bold" style={{
                  color: 'var(--warning)'
                }}>{stats.nearLimitBudgets}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: 'var(--error-bg)'
              }}>
                <FontAwesomeIcon 
                  icon={faExclamationTriangle} 
                  className="w-5 h-5" 
                  style={{ color: 'var(--error)' }}
                />
              </div>
              <div>
                <p className="text-sm font-medium" style={{
                  color: 'var(--text-secondary)'
                }}>Exceeded</p>
                <p className="text-2xl font-bold" style={{
                  color: 'var(--error)'
                }}>{stats.exceededBudgets}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* View Mode Selector */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center space-x-1 p-1 w-fit rounded-lg transition-colors duration-300" style={{
            backgroundColor: 'var(--bg-secondary)'
          }}>
            {viewModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => {
                  setViewMode(mode.key);
                  // Reset viewing budget when switching tabs
                  if (viewingBudget) {
                    setViewingBudget(null);
                  }
                }}
                className="relative px-4 py-2 rounded flex items-center space-x-2 transition-all duration-200"
                style={{
                  backgroundColor: viewMode === mode.key 
                    ? 'var(--bg-card)' 
                    : 'transparent',
                  color: viewMode === mode.key 
                    ? 'var(--accent-primary)' 
                    : 'var(--text-secondary)',
                  boxShadow: viewMode === mode.key 
                    ? 'var(--shadow-sm)' 
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== mode.key) {
                    e.target.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== mode.key) {
                    e.target.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <FontAwesomeIcon icon={mode.icon} className="w-4 h-4" />
                <span className="font-medium">{mode.label}</span>
                {mode.badge && (
                  <span className="absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{
                    backgroundColor: 'var(--error)',
                    color: 'var(--text-inverse)'
                  }}>
                    {mode.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Budget Detail View */}
          {viewingBudget ? (
            <BudgetDetail
              budget={viewingBudget}
              onBack={handleBackToBudgetList}
              onEditBudget={handleEditBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          ) : (
            <>
              {/* Overview Mode */}
              {viewMode === 'overview' && (
                <div className="space-y-6">
                  {/* Budget Progress Overview */}
                  <BudgetProgress
                    budgetOverview={overview}
                    isLoading={isLoading}
                    onBudgetClick={handleBudgetClick}
                    onCreateBudget={handleCreateBudget}
                    showCreateButton={true}
                  />

                  {/* Budget Analytics Summary */}
                  {analytics && (
                    <Card title="Budget Analytics">
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-2" style={{
                              color: 'var(--accent-primary)'
                            }}>
                              {analytics.formattedTotalBudget}
                            </div>
                            <div className="text-sm" style={{
                              color: 'var(--text-secondary)'
                            }}>Total Budget Amount</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-2" style={{
                              color: 'var(--error)'
                            }}>
                              {analytics.formattedTotalSpent}
                            </div>
                            <div className="text-sm" style={{
                              color: 'var(--text-secondary)'
                            }}>Total Spent</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-2" style={{
                              color: 'var(--text-primary)'
                            }}>
                              {analytics.formattedUtilization}
                            </div>
                            <div className="text-sm" style={{
                              color: 'var(--text-secondary)'
                            }}>Overall Utilization</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* List Management Mode */}
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

              {/* Alerts Mode */}
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

        {/* Budget Form Modal */}
        <BudgetFormModal
          isOpen={showBudgetModal}
          onClose={handleModalClose}
          budget={editingBudget}
          onBudgetSaved={handleBudgetSaved}
        />

        {/* Error Display */}
        {hasError && (
          <Card className="mt-6">
            <div className="p-4 rounded-lg" style={{
              backgroundColor: 'var(--error-bg)',
              borderColor: 'var(--error-border)',
              borderWidth: '1px'
            }}>
              <p style={{
                color: 'var(--error)'
              }}>
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