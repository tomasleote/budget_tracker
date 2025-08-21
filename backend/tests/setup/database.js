"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSupabase = void 0;
exports.setupTestDatabase = setupTestDatabase;
exports.cleanupTestDatabase = cleanupTestDatabase;
exports.resetMockDatabase = resetMockDatabase;
exports.verifyTestDatabaseConnection = verifyTestDatabaseConnection;
exports.seedDefaultCategoriesData = seedDefaultCategoriesData;
const DEFAULT_CATEGORIES = [
    { name: 'Food & Dining', type: 'expense', color: '#FF6B6B', icon: 'utensils', is_default: true },
    { name: 'Transportation', type: 'expense', color: '#4ECDC4', icon: 'car', is_default: true },
    { name: 'Shopping', type: 'expense', color: '#95E1D3', icon: 'shopping-bag', is_default: true },
    { name: 'Entertainment', type: 'expense', color: '#F6D55C', icon: 'gamepad', is_default: true },
    { name: 'Bills & Utilities', type: 'expense', color: '#ED553B', icon: 'file-invoice-dollar', is_default: true },
    { name: 'Healthcare', type: 'expense', color: '#20639B', icon: 'heartbeat', is_default: true },
    { name: 'Education', type: 'expense', color: '#173F5F', icon: 'graduation-cap', is_default: true },
    { name: 'Personal Care', type: 'expense', color: '#3CAEA3', icon: 'spa', is_default: true },
    { name: 'Home', type: 'expense', color: '#F6D55C', icon: 'home', is_default: true },
    { name: 'Other', type: 'expense', color: '#95A5A6', icon: 'ellipsis-h', is_default: true },
    { name: 'Salary', type: 'income', color: '#2ECC71', icon: 'briefcase', is_default: true },
    { name: 'Freelance', type: 'income', color: '#3498DB', icon: 'laptop', is_default: true },
    { name: 'Investment', type: 'income', color: '#9B59B6', icon: 'chart-line', is_default: true },
    { name: 'Business', type: 'income', color: '#E74C3C', icon: 'store', is_default: true },
    { name: 'Gift', type: 'income', color: '#F39C12', icon: 'gift', is_default: true },
    { name: 'Other Income', type: 'income', color: '#95A5A6', icon: 'plus-circle', is_default: true }
];
let mockDatabase = {
    categories: [],
    transactions: [],
    budgets: []
};
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
exports.testSupabase = {
    from: (table) => {
        let query = [...(mockDatabase[table] || [])];
        let filters = [];
        const applyFilters = () => {
            return query.filter(item => {
                return filters.every(filter => {
                    switch (filter.op) {
                        case 'eq':
                            return item[filter.column] === filter.value;
                        case 'neq':
                            return item[filter.column] !== filter.value;
                        case 'is':
                            return item[filter.column] === filter.value;
                        case 'not':
                            if (filter.operator === 'is' && filter.value === null) {
                                return item[filter.column] !== null;
                            }
                            return true;
                        default:
                            return true;
                    }
                });
            });
        };
        const methods = {
            select: () => methods,
            insert: (data) => {
                const items = Array.isArray(data) ? data : [data];
                const inserted = items.map(item => ({
                    ...item,
                    id: item.id || generateId(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));
                mockDatabase[table].push(...inserted);
                query = inserted;
                return methods;
            },
            update: (data) => {
                const filtered = applyFilters();
                filtered.forEach(item => {
                    Object.assign(item, data, { updated_at: new Date().toISOString() });
                });
                query = filtered;
                return methods;
            },
            delete: () => {
                const filtered = applyFilters();
                filtered.forEach(item => {
                    const index = mockDatabase[table].indexOf(item);
                    if (index > -1) {
                        mockDatabase[table].splice(index, 1);
                    }
                });
                query = filtered;
                return methods;
            },
            eq: (column, value) => {
                filters.push({ column, op: 'eq', value });
                return methods;
            },
            neq: (column, value) => {
                filters.push({ column, op: 'neq', value });
                return methods;
            },
            is: (column, value) => {
                filters.push({ column, op: 'is', value });
                return methods;
            },
            not: (column, operator, value) => {
                filters.push({ column, op: 'not', operator, value });
                return methods;
            },
            single: async () => {
                const result = applyFilters();
                return { data: result[0] || null, error: null };
            },
            then: async (resolve) => {
                const result = applyFilters();
                return resolve({ data: result, error: null });
            }
        };
        return methods;
    }
};
async function setupTestDatabase() {
    console.log('Setting up test database...');
    resetMockDatabase();
    console.log('Test database setup complete');
}
async function cleanupTestDatabase() {
    console.log('Cleaning up test database...');
    resetMockDatabase();
    console.log('Test database cleanup complete');
}
function resetMockDatabase() {
    mockDatabase = {
        categories: [],
        transactions: [],
        budgets: []
    };
}
async function verifyTestDatabaseConnection() {
    console.log('Using mock database for tests');
    return true;
}
function seedDefaultCategoriesData() {
    mockDatabase.categories = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        id: generateId(),
        is_active: true,
        parent_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));
}
//# sourceMappingURL=database.js.map