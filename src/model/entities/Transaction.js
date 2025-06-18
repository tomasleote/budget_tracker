import { 
  validateTransaction, 
  generateTransactionId, 
  formatCurrency, 
  formatDate,
  isValidDate,
  TRANSACTION_TYPES,
  ICON_UTILS
} from '../../controller/utils/index.js';

class Transaction {
  constructor({
    id = null,
    type = '',
    amount = 0,
    description = '',
    category = '',
    date = new Date(),
    createdAt = new Date(),
    updatedAt = new Date()
  } = {}) {
    this.id = id || generateTransactionId();
    this.type = type;
    this.amount = parseFloat(amount) || 0;
    this.description = description.trim();
    this.category = category;
    this.date = new Date(date);
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
    
    this.validate();
  }

  // Validation using utility functions
  validate() {
    const validation = validateTransaction({
      type: this.type,
      amount: this.amount,
      description: this.description,
      category: this.category,
      date: this.date
    });

    if (!validation.isValid) {
      throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
    }
  }

  // Update transaction
  update(data) {
    const allowedFields = ['type', 'amount', 'description', 'category', 'date'];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        if (field === 'amount') {
          this[field] = parseFloat(data[field]) || 0;
        } else if (field === 'date') {
          this[field] = new Date(data[field]);
        } else if (field === 'description') {
          this[field] = data[field].trim();
        } else {
          this[field] = data[field];
        }
      }
    });

    this.updatedAt = new Date();
    this.validate();
    return this;
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      amount: this.amount,
      description: this.description,
      category: this.category,
      date: this.date.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new Transaction({
      ...data,
      date: new Date(data.date),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }

  // Helper methods using utilities
  isIncome() {
    return this.type === 'income';
  }

  isExpense() {
    return this.type === 'expense';
  }

  getFormattedAmount() {
    return formatCurrency(this.amount);
  }

  getFormattedDate() {
    return formatDate(this.date);
  }

  getTypeInfo() {
    return TRANSACTION_TYPES[this.type.toUpperCase()] || {
      value: this.type,
      label: this.type,
      color: '#999',
      icon: 'fas fa-question-circle'
    };
  }

  getCategoryIcon() {
    return ICON_UTILS.getCategoryIcon(this.category, this.type);
  }

  getTransactionIcon() {
    return ICON_UTILS.getTransactionIcon(this.type);
  }
}

export default Transaction;