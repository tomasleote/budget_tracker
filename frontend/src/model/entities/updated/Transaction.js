/**
 * Transaction Entity - Updated to match backend schema
 * 
 * Simplified version without complex utility imports
 */
class Transaction {
  constructor({
    id = null,
    type = '',
    amount = 0,
    description = '',
    categoryId = '',
    category_id = '',
    category = null,
    date = new Date(),
    createdAt = new Date(),
    created_at = new Date(),
    updatedAt = new Date(),
    updated_at = new Date()
  } = {}) {
    this.id = id || this.generateId();
    this.type = type;
    this.amount = parseFloat(amount) || 0;
    this.description = description.trim();
    this.categoryId = categoryId || category_id;
    this.category = category;
    
    // Handle both camelCase and snake_case dates
    this.date = this.parseDate(date);
    this.createdAt = this.parseDate(createdAt || created_at);
    this.updatedAt = this.parseDate(updatedAt || updated_at);
    
    this.validate();
  }

  parseDate(date) {
    if (!date) return new Date();
    return date instanceof Date ? date : new Date(date);
  }

  generateId() {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  validate() {
    const errors = [];

    if (!this.type || !['income', 'expense'].includes(this.type)) {
      errors.push('Type must be either income or expense');
    }

    if (!this.amount || this.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (this.amount > 999999999.99) {
      errors.push('Amount cannot exceed 999,999,999.99');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (this.description.length > 255) {
      errors.push('Description must be 255 characters or less');
    }

    if (!this.categoryId) {
      errors.push('Category is required');
    }

    if (!(this.date instanceof Date) || isNaN(this.date)) {
      errors.push('Valid date is required');
    }

    if (errors.length > 0) {
      throw new Error(`Transaction validation failed: ${errors.join(', ')}`);
    }
  }

  update(data) {
    const allowedFields = [
      'type', 'amount', 'description', 'categoryId', 'category_id', 'category', 'date'
    ];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        if (field === 'amount') {
          this[field] = parseFloat(data[field]) || 0;
        } else if (field === 'date') {
          this[field] = this.parseDate(data[field]);
        } else if (field === 'description') {
          this[field] = data[field].trim();
        } else if (field === 'categoryId' || field === 'category_id') {
          this.categoryId = data[field];
        } else if (field === 'category') {
          if (typeof data[field] === 'string') {
            this.categoryId = data[field];
          } else if (data[field] && data[field].id) {
            this.categoryId = data[field].id;
            this.category = data[field];
          }
        } else {
          this[field] = data[field];
        }
      }
    });

    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  toJSON() {
    const json = {
      id: this.id,
      type: this.type,
      amount: this.amount,
      description: this.description,
      categoryId: this.categoryId,
      date: this.date.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };

    if (this.category) {
      json.category = this.category;
    }

    return json;
  }

  static fromJSON(data) {
    const categoryId = data.categoryId || data.category_id || (typeof data.category === 'string' ? data.category : null);
    const categoryObject = typeof data.category === 'object' ? data.category : null;

    return new Transaction({
      ...data,
      categoryId,
      category: categoryObject,
      date: new Date(data.date),
      createdAt: new Date(data.createdAt || data.created_at),
      updatedAt: new Date(data.updatedAt || data.updated_at)
    });
  }

  // Helper methods
  isIncome() {
    return this.type === 'income';
  }

  isExpense() {
    return this.type === 'expense';
  }

  getCategoryId() {
    return this.categoryId;
  }

  getCategoryName() {
    if (this.category && this.category.name) {
      return this.category.name;
    }
    return this.categoryId;
  }

  getCategoryColor() {
    if (this.category && this.category.color) {
      return this.category.color;
    }
    return '#6B7280';
  }

  getFormattedAmount() {
    return `$${this.amount.toFixed(2)}`;
  }

  getFormattedDate() {
    return this.date.toLocaleDateString();
  }

  isTemporaryId() {
    return this.id && !this.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  }
}

export default Transaction;
