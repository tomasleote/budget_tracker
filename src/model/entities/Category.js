class Category {
  constructor({
    id = null,
    name = '',
    type = 'expense',
    color = '#3B82F6',
    icon = 'fa-solid fa-circle',
    description = '',
    isDefault = false,
    isActive = true,
    parentId = null,
    createdAt = new Date(),
    updatedAt = new Date()
  } = {}) {
    this.id = id || this.generateId();
    this.name = name.trim();
    this.type = type;
    this.color = color;
    this.icon = icon;
    this.description = description.trim();
    this.isDefault = Boolean(isDefault);
    this.isActive = Boolean(isActive);
    this.parentId = parentId;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
    
    this.validate();
  }

  // Generate unique ID
  generateId() {
    return 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Validation method
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Category name is required');
    }

    if (this.name.length > 50) {
      errors.push('Category name must be 50 characters or less');
    }

    if (!['income', 'expense'].includes(this.type)) {
      errors.push('Type must be either "income" or "expense"');
    }

    if (!this.color || !this.isValidHexColor(this.color)) {
      errors.push('Valid hex color is required');
    }

    if (!this.icon || this.icon.trim().length === 0) {
      errors.push('Icon is required');
    }

    if (this.description && this.description.length > 200) {
      errors.push('Description must be 200 characters or less');
    }

    if (errors.length > 0) {
      throw new Error(`Category validation failed: ${errors.join(', ')}`);
    }
  }

  // Validate hex color
  isValidHexColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  // Update category
  update(data) {
    const allowedFields = ['name', 'type', 'color', 'icon', 'description', 'isActive', 'parentId'];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        if (field === 'name' || field === 'description') {
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

  // Check if category is a parent category
  isParentCategory() {
    return this.parentId === null;
  }

  // Check if category is a subcategory
  isSubcategory() {
    return this.parentId !== null;
  }

  // Deactivate category
  deactivate() {
    if (this.isDefault) {
      throw new Error('Cannot deactivate default category');
    }
    this.isActive = false;
    this.updatedAt = new Date();
    return this;
  }

  // Activate category
  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
    return this;
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      color: this.color,
      icon: this.icon,
      description: this.description,
      isDefault: this.isDefault,
      isActive: this.isActive,
      parentId: this.parentId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  // Create from plain object
  static fromJSON(data) {
    return new Category({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }

  // Static method to create default categories
  static getDefaultCategories() {
    const defaultExpenseCategories = [
      { name: 'Food & Dining', color: '#EF4444', icon: 'fa-solid fa-utensils' },
      { name: 'Transportation', color: '#F59E0B', icon: 'fa-solid fa-car' },
      { name: 'Shopping', color: '#8B5CF6', icon: 'fa-solid fa-shopping-bag' },
      { name: 'Entertainment', color: '#EC4899', icon: 'fa-solid fa-film' },
      { name: 'Bills & Utilities', color: '#6B7280', icon: 'fa-solid fa-receipt' },
      { name: 'Healthcare', color: '#10B981', icon: 'fa-solid fa-heart' },
      { name: 'Education', color: '#3B82F6', icon: 'fa-solid fa-graduation-cap' },
      { name: 'Personal Care', color: '#F472B6', icon: 'fa-solid fa-user' },
      { name: 'Home', color: '#059669', icon: 'fa-solid fa-home' },
      { name: 'Other', color: '#6B7280', icon: 'fa-solid fa-ellipsis-h' }
    ];

    const defaultIncomeCategories = [
      { name: 'Salary', color: '#10B981', icon: 'fa-solid fa-dollar-sign' },
      { name: 'Freelance', color: '#3B82F6', icon: 'fa-solid fa-laptop' },
      { name: 'Investment', color: '#8B5CF6', icon: 'fa-solid fa-chart-line' },
      { name: 'Gift', color: '#F59E0B', icon: 'fa-solid fa-gift' },
      { name: 'Other', color: '#6B7280', icon: 'fa-solid fa-plus' }
    ];

    const categories = [];

    // Add expense categories
    defaultExpenseCategories.forEach(cat => {
      categories.push(new Category({
        ...cat,
        type: 'expense',
        isDefault: true
      }));
    });

    // Add income categories
    defaultIncomeCategories.forEach(cat => {
      categories.push(new Category({
        ...cat,
        type: 'income',
        isDefault: true
      }));
    });

    return categories;
  }
}

export default Category;