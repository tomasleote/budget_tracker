import { 
  roundCurrency,
  getBudgetStatus,
  formatCurrency,
  formatPercentage,
  BUDGET_STATUS,
  ICON_UTILS
} from '../../controller/utils/index.js';

class Budget {
  constructor({
    id = null,
    category = '',
    budgetAmount = 0,
    spent = 0,
    period = 'monthly',
    startDate = null,
    endDate = null,
    isActive = true,
    createdAt = new Date(),
    updatedAt = new Date()
  } = {}) {
    this.id = id || this.generateId();
    this.category = category.trim();
    this.budgetAmount = parseFloat(budgetAmount) || 0;
    this.spent = parseFloat(spent) || 0;
    this.period = period;
    this.startDate = startDate ? new Date(startDate) : this.getDefaultStartDate();
    this.endDate = endDate ? new Date(endDate) : this.getDefaultEndDate();
    this.isActive = Boolean(isActive);
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
    
    this.validate();
  }

  // Generate unique ID
  generateId() {
    return 'bdg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get default start date based on period
  getDefaultStartDate() {
    const now = new Date();
    if (this.period === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (this.period === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day;
      return new Date(now.setDate(diff));
    }
    return now;
  }

  // Get default end date based on period
  getDefaultEndDate() {
    const now = new Date();
    if (this.period === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (this.period === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + 6;
      return new Date(now.setDate(diff));
    }
    return now;
  }

  // Validation method
  validate() {
    const errors = [];

    if (!this.category || this.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (!this.budgetAmount || this.budgetAmount <= 0) {
      errors.push('Budget amount must be greater than 0');
    }

    if (this.spent < 0) {
      errors.push('Spent amount cannot be negative');
    }

    if (!['monthly', 'weekly', 'yearly'].includes(this.period)) {
      errors.push('Period must be monthly, weekly, or yearly');
    }

    if (!(this.startDate instanceof Date) || isNaN(this.startDate)) {
      errors.push('Valid start date is required');
    }

    if (!(this.endDate instanceof Date) || isNaN(this.endDate)) {
      errors.push('Valid end date is required');
    }

    if (this.startDate >= this.endDate) {
      errors.push('End date must be after start date');
    }

    if (errors.length > 0) {
      throw new Error(`Budget validation failed: ${errors.join(', ')}`);
    }
  }

  // Update budget
  update(data) {
    const allowedFields = ['category', 'budgetAmount', 'spent', 'period', 'startDate', 'endDate', 'isActive'];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        if (field === 'budgetAmount' || field === 'spent') {
          this[field] = parseFloat(data[field]) || 0;
        } else if (field === 'startDate' || field === 'endDate') {
          this[field] = new Date(data[field]);
        } else if (field === 'category') {
          this[field] = data[field].trim();
        } else if (field === 'isActive') {
          this[field] = Boolean(data[field]);
        } else {
          this[field] = data[field];
        }
      }
    });

    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  // Add to spent amount
  addSpent(amount) {
    this.spent += parseFloat(amount) || 0;
    this.updatedAt = new Date();
    return this;
  }

  // Subtract from spent amount
  subtractSpent(amount) {
    this.spent = Math.max(0, this.spent - (parseFloat(amount) || 0));
    this.updatedAt = new Date();
    return this;
  }

  // Calculate remaining budget using utilities
  getRemainingAmount() {
    return Math.max(0, roundCurrency(this.budgetAmount - this.spent));
  }

  // Calculate percentage spent using utilities
  getSpentPercentage() {
    if (this.budgetAmount === 0) return 0;
    return Math.round((this.spent / this.budgetAmount) * 100);
  }

  // Check if budget is exceeded
  isExceeded() {
    return this.spent > this.budgetAmount;
  }

  // Check if budget is close to limit (80% or more)
  isNearLimit() {
    return this.getSpentPercentage() >= 80;
  }

  // Get status using utility functions
  getStatus() {
    return getBudgetStatus(this.getSpentPercentage(), this.spent, this.budgetAmount);
  }

  // Get status info with icon
  getStatusInfo() {
    const status = this.getStatus();
    const statusConfig = Object.values(BUDGET_STATUS).find(s => s.value === status) || BUDGET_STATUS.NORMAL;
    return {
      ...statusConfig,
      icon: ICON_UTILS.getBudgetStatusIcon(status)
    };
  }

  // Get category icon
  getCategoryIcon() {
    return ICON_UTILS.getCategoryIcon(this.category, 'expense');
  }

  // Check if budget is currently active
  isCurrentlyActive() {
    const now = new Date();
    const isWithinDateRange = now >= this.startDate && now <= this.endDate;
    return this.isActive && isWithinDateRange;
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      category: this.category,
      budgetAmount: this.budgetAmount,
      spent: this.spent,
      period: this.period,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new Budget({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }

  // Helper methods using utilities
  getFormattedBudgetAmount() {
    return formatCurrency(this.budgetAmount);
  }

  getFormattedSpentAmount() {
    return formatCurrency(this.spent);
  }

  getFormattedRemainingAmount() {
    return formatCurrency(this.getRemainingAmount());
  }

  getFormattedPercentage() {
    return formatPercentage(this.getSpentPercentage());
  }

  // Get progress information
  getProgressInfo() {
    const percentage = this.getSpentPercentage();
    const status = this.getStatus();
    const statusInfo = this.getStatusInfo();
    
    return {
      budgetAmount: this.budgetAmount,
      spent: this.spent,
      remaining: this.getRemainingAmount(),
      percentage,
      status,
      statusInfo,
      isExceeded: this.isExceeded(),
      isNearLimit: this.isNearLimit(),
      formattedBudgetAmount: this.getFormattedBudgetAmount(),
      formattedSpentAmount: this.getFormattedSpentAmount(),
      formattedRemainingAmount: this.getFormattedRemainingAmount(),
      formattedPercentage: this.getFormattedPercentage(),
      categoryIcon: this.getCategoryIcon(),
      statusIcon: statusInfo.icon
    };
  }
}

export default Budget;