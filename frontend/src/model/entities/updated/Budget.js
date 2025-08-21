/**
 * Budget Entity - Updated to match backend schema
 * 
 * Simplified version without complex utility imports
 */
class Budget {
  constructor({
    id = null,
    name = '',
    categoryId = '',
    category_id = '',
    category = null,
    budgetAmount = 0,
    amount = 0,
    spent = 0,
    period = 'monthly',
    startDate = null,
    start_date = null,
    endDate = null,
    end_date = null,
    isActive = true,
    is_active = true,
    description = '',
    alertThreshold = 80,
    alert_threshold = 80,
    createdAt = new Date(),
    created_at = new Date(),
    updatedAt = new Date(),
    updated_at = new Date(),
    progress = null
  } = {}) {
    this.id = id || this.generateId();
    this.name = name.trim();
    this.categoryId = categoryId || category_id;
    this.category = category;
    this.amount = parseFloat(budgetAmount || amount) || 0;
    this.period = period;
    this.description = description ? description.trim() : '';
    this.alertThreshold = parseInt(alertThreshold || alert_threshold) || 80;
    this.isActive = Boolean(isActive !== undefined ? isActive : is_active);
    this.startDate = this.parseDate(startDate || start_date) || this.getDefaultStartDate();
    this.endDate = this.parseDate(endDate || end_date) || this.getDefaultEndDate();
    this.createdAt = this.parseDate(createdAt || created_at);
    this.updatedAt = this.parseDate(updatedAt || updated_at);
    
    if (progress) {
      this.spent = parseFloat(progress.spent || 0);
      this.progress = {
        spent: parseFloat(progress.spent || 0),
        remaining: parseFloat(progress.remaining || this.amount),
        percentage: parseFloat(progress.percentage || 0),
        isOverBudget: progress.is_over_budget || progress.isOverBudget || false,
        daysRemaining: progress.days_remaining || progress.daysRemaining || 0
      };
    } else {
      this.spent = parseFloat(spent) || 0;
    }
    
    this.validate();
  }

  parseDate(date) {
    if (!date) return null;
    return date instanceof Date ? date : new Date(date);
  }

  generateId() {
    return 'bdg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getDefaultStartDate() {
    const now = new Date();
    switch (this.period) {
      case 'weekly':
        const day = now.getDay();
        const diff = now.getDate() - day;
        return new Date(now.setDate(diff));
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return now;
    }
  }

  getDefaultEndDate() {
    const start = this.startDate || this.getDefaultStartDate();
    const end = new Date(start);
    
    switch (this.period) {
      case 'weekly':
        end.setDate(end.getDate() + 6);
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        end.setDate(0);
        break;
    }
    
    return end;
  }

  validate() {
    const errors = [];
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Budget name is required');
    }
    if (!this.categoryId) {
      errors.push('Category is required');
    }
    if (!this.amount || this.amount <= 0) {
      errors.push('Budget amount must be greater than 0');
    }
    if (!['weekly', 'monthly', 'yearly'].includes(this.period)) {
      errors.push('Period must be weekly, monthly, or yearly');
    }
    if (errors.length > 0) {
      throw new Error(`Budget validation failed: ${errors.join(', ')}`);
    }
  }

  update(data) {
    const allowedFields = [
      'name', 'categoryId', 'category_id', 'amount', 'budgetAmount',
      'period', 'startDate', 'start_date', 'endDate', 'end_date',
      'isActive', 'is_active', 'description', 'alertThreshold', 'alert_threshold'
    ];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        if (field === 'budgetAmount' || field === 'amount') {
          this.amount = parseFloat(data[field]) || 0;
        } else if (field === 'categoryId' || field === 'category_id') {
          this.categoryId = data[field];
        } else if (field === 'startDate' || field === 'start_date') {
          this.startDate = this.parseDate(data[field]);
        } else if (field === 'endDate' || field === 'end_date') {
          this.endDate = this.parseDate(data[field]);
        } else if (field === 'name' || field === 'description') {
          this[field] = data[field] ? data[field].trim() : '';
        } else if (field === 'isActive' || field === 'is_active') {
          this.isActive = Boolean(data[field]);
        } else if (field === 'alertThreshold' || field === 'alert_threshold') {
          this.alertThreshold = parseInt(data[field]) || 80;
        } else {
          this[field] = data[field];
        }
      }
    });

    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  getRemainingAmount() {
    return Math.max(0, this.amount - this.spent);
  }

  getSpentPercentage() {
    if (this.amount === 0) return 0;
    return Math.round((this.spent / this.amount) * 100);
  }

  isExceeded() {
    return this.spent > this.amount;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      categoryId: this.categoryId,
      amount: this.amount,
      spent: this.spent,
      period: this.period,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate ? this.endDate.toISOString() : null,
      isActive: this.isActive,
      description: this.description,
      alertThreshold: this.alertThreshold,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      category: this.category,
      progress: this.progress
    };
  }

  static fromJSON(data) {
    return new Budget(data);
  }

  // Backward compatibility
  get budgetAmount() {
    return this.amount;
  }

  set budgetAmount(value) {
    this.amount = value;
  }
}

export default Budget;
