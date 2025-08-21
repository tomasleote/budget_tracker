/**
 * Category Entity - Updated to match backend schema
 * 
 * Changes from original:
 * - Enhanced to support backend snake_case fields
 * - Improved UUID validation
 * - Added backward compatibility for both camelCase and snake_case
 */
class Category {
  constructor({
    id = null,
    name = '',
    type = 'expense',
    color = '#3B82F6',
    icon = 'fa-solid fa-circle',
    description = '',
    isDefault = false,
    is_default = false, // Snake case support
    isActive = true,
    is_active = true, // Snake case support
    parentId = null,
    parent_id = null, // Snake case support
    createdAt = new Date(),
    created_at = new Date(), // Snake case support
    updatedAt = new Date(),
    updated_at = new Date() // Snake case support
  } = {}) {
    // Use UUID if provided, otherwise generate temporary ID
    this.id = id || this.generateId();
    this.name = name.trim();
    this.type = type;
    this.color = color;
    this.icon = icon;
    this.description = description ? description.trim() : '';
    
    // Handle both camelCase and snake_case
    this.isDefault = Boolean(isDefault || is_default);
    this.isActive = Boolean(isActive !== undefined ? isActive : is_active);
    this.parentId = parentId || parent_id;
    
    // Handle dates with both formats
    this.createdAt = this.parseDate(createdAt || created_at);
    this.updatedAt = this.parseDate(updatedAt || updated_at);
    
    this.validate();
  }

  // Parse date helper
  parseDate(date) {
    if (!date) return new Date();
    return date instanceof Date ? date : new Date(date);
  }

  // Generate temporary ID (for local use before backend creation)
  generateId() {
    return 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Check if this is a temporary/local ID
  isTemporaryId() {
    return this.id && !this.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  }

  // Enhanced validation for backend compatibility
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

    if (this.icon && this.icon.length > 50) {
      errors.push('Icon class name must be 50 characters or less');
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
    const allowedFields = ['name', 'type', 'color', 'icon', 'description', 'isActive', 'is_active', 'parentId', 'parent_id'];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        if (field === 'name' || field === 'description') {
          this[field] = data[field] ? data[field].trim() : '';
        } else if (field === 'isActive' || field === 'is_active') {
          this.isActive = Boolean(data[field]);
        } else if (field === 'parentId' || field === 'parent_id') {
          this.parentId = data[field];
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

  // Convert to plain object for storage/API
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

  // Convert to backend format (snake_case)
  toBackendFormat() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      color: this.color,
      icon: this.icon,
      description: this.description,
      is_default: this.isDefault,
      is_active: this.isActive,
      parent_id: this.parentId,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString()
    };
  }

  // Create from plain object with backward compatibility
  static fromJSON(data) {
    return new Category({
      ...data,
      // Support both formats
      isDefault: data.isDefault || data.is_default,
      isActive: data.isActive !== undefined ? data.isActive : data.is_active,
      parentId: data.parentId || data.parent_id,
      createdAt: new Date(data.createdAt || data.created_at),
      updatedAt: new Date(data.updatedAt || data.updated_at)
    });
  }

  // Static method to create default categories with UUIDs
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
      { name: 'Other Income', color: '#6B7280', icon: 'fa-solid fa-plus' }
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
