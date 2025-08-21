"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CATEGORIES = exports.generateId = exports.mockDatabase = void 0;
exports.resetMockDatabase = resetMockDatabase;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env' });
process.env.NODE_ENV = 'test';
const mockDatabase = {
    categories: [],
    transactions: [],
    budgets: []
};
exports.mockDatabase = mockDatabase;
const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
exports.generateId = generateId;
const DEFAULT_CATEGORIES = [
    { name: 'Food & Dining', type: 'expense', color: '#FF6B6B', icon: 'utensils' },
    { name: 'Transportation', type: 'expense', color: '#4ECDC4', icon: 'car' },
    { name: 'Shopping', type: 'expense', color: '#95E1D3', icon: 'shopping-bag' },
    { name: 'Entertainment', type: 'expense', color: '#F6D55C', icon: 'gamepad' },
    { name: 'Bills & Utilities', type: 'expense', color: '#ED553B', icon: 'file-invoice-dollar' },
    { name: 'Healthcare', type: 'expense', color: '#20639B', icon: 'heartbeat' },
    { name: 'Education', type: 'expense', color: '#173F5F', icon: 'graduation-cap' },
    { name: 'Personal Care', type: 'expense', color: '#3CAEA3', icon: 'spa' },
    { name: 'Home', type: 'expense', color: '#F6D55C', icon: 'home' },
    { name: 'Other', type: 'expense', color: '#95A5A6', icon: 'ellipsis-h' },
    { name: 'Salary', type: 'income', color: '#2ECC71', icon: 'briefcase' },
    { name: 'Freelance', type: 'income', color: '#3498DB', icon: 'laptop' },
    { name: 'Investment', type: 'income', color: '#9B59B6', icon: 'chart-line' },
    { name: 'Business', type: 'income', color: '#E74C3C', icon: 'store' },
    { name: 'Gift', type: 'income', color: '#F39C12', icon: 'gift' },
    { name: 'Other Income', type: 'income', color: '#95A5A6', icon: 'plus-circle' }
];
exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
jest.mock('@supabase/supabase-js', () => {
    return {
        createClient: jest.fn(() => {
            return {
                from: jest.fn((table) => {
                    let currentQuery = [...(mockDatabase[table] || [])];
                    let filters = [];
                    let orderBy = null;
                    let limitCount = null;
                    let rangeStart = null;
                    let rangeEnd = null;
                    const applyFilters = () => {
                        let result = [...currentQuery];
                        filters.forEach(filter => {
                            result = result.filter(item => {
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
                                    case 'in':
                                        return filter.values.includes(item[filter.column]);
                                    case 'like':
                                    case 'ilike':
                                        const pattern = filter.pattern.replace(/%/g, '.*');
                                        const regex = new RegExp(pattern, filter.op === 'ilike' ? 'i' : '');
                                        return regex.test(item[filter.column] || '');
                                    default:
                                        return true;
                                }
                            });
                        });
                        if (orderBy) {
                            result.sort((a, b) => {
                                const aVal = a[orderBy.column];
                                const bVal = b[orderBy.column];
                                if (aVal < bVal)
                                    return orderBy.ascending ? -1 : 1;
                                if (aVal > bVal)
                                    return orderBy.ascending ? 1 : -1;
                                return 0;
                            });
                        }
                        if (rangeStart !== null && rangeEnd !== null) {
                            result = result.slice(rangeStart, rangeEnd + 1);
                        }
                        else if (limitCount !== null) {
                            result = result.slice(0, limitCount);
                        }
                        return result;
                    };
                    const createQueryBuilder = () => {
                        const qb = {};
                        qb.select = jest.fn((fields, options) => {
                            if (options && options.count === 'exact' && options.head) {
                                qb.then = jest.fn((resolve) => {
                                    const data = applyFilters();
                                    return resolve({ data: null, error: null, count: data.length });
                                });
                            }
                            return qb;
                        });
                        qb.single = jest.fn(async () => {
                            try {
                                const data = applyFilters();
                                const result = data[0] || null;
                                return { data: result, error: null };
                            }
                            catch (error) {
                                return { data: null, error: 'Mock error in single()' };
                            }
                        });
                        qb.then = jest.fn((resolve) => {
                            try {
                                const data = applyFilters();
                                return resolve({ data, error: null, count: data.length });
                            }
                            catch (error) {
                                return resolve({ data: [], error: null, count: 0 });
                            }
                        });
                        qb.eq = jest.fn((column, value) => {
                            filters.push({ column, op: 'eq', value });
                            return qb;
                        });
                        qb.is = jest.fn((column, value) => {
                            filters.push({ column, op: 'is', value });
                            return qb;
                        });
                        qb.neq = jest.fn((column, value) => {
                            filters.push({ column, op: 'neq', value });
                            return qb;
                        });
                        qb.not = jest.fn((column, operator, value) => {
                            filters.push({ column, op: 'not', operator, value });
                            return qb;
                        });
                        qb.in = jest.fn((column, values) => {
                            filters.push({ column, op: 'in', values });
                            return qb;
                        });
                        qb.like = jest.fn((column, pattern) => {
                            filters.push({ column, op: 'like', pattern });
                            return qb;
                        });
                        qb.ilike = jest.fn((column, pattern) => {
                            filters.push({ column, op: 'ilike', pattern });
                            return qb;
                        });
                        qb.order = jest.fn((column, options) => {
                            orderBy = { column, ascending: options?.ascending !== false };
                            return qb;
                        });
                        qb.limit = jest.fn((count) => {
                            limitCount = count;
                            return qb;
                        });
                        qb.range = jest.fn((start, end) => {
                            rangeStart = start;
                            rangeEnd = end;
                            return qb;
                        });
                        qb.or = jest.fn((orString) => {
                            const orGroups = orString.split('),(').map(s => s.replace(/[()]/g, ''));
                            const conditions = orGroups.map(group => {
                                return group.split(',').map(cond => {
                                    const [field, op, value] = cond.split('.');
                                    let parsedValue = value;
                                    if (value === 'null')
                                        parsedValue = null;
                                    else if (value === 'true')
                                        parsedValue = true;
                                    else if (value === 'false')
                                        parsedValue = false;
                                    return { field, op, value: parsedValue };
                                });
                            });
                            const filtered = applyFilters().filter((item) => conditions.some(group => group.every(cond => {
                                if (cond.op === 'eq')
                                    return item[cond.field] === cond.value;
                                return false;
                            })));
                            const newQb = createQueryBuilder();
                            newQb.then = jest.fn((resolve) => {
                                return resolve({ data: filtered, error: null, count: filtered.length });
                            });
                            return newQb;
                        });
                        qb.insert = jest.fn((data) => {
                            const items = Array.isArray(data) ? data : [data];
                            const inserted = items.map(item => ({
                                ...item,
                                id: item.id || generateId(),
                                created_at: item.created_at || new Date().toISOString(),
                                updated_at: item.updated_at || new Date().toISOString(),
                                parent_id: item.parent_id === undefined ? null : item.parent_id
                            }));
                            mockDatabase[table].push(...inserted);
                            currentQuery = inserted;
                            const insertQb = createQueryBuilder();
                            insertQb.then = jest.fn((resolve) => {
                                return resolve({ data: inserted, error: null, count: inserted.length });
                            });
                            return insertQb;
                        });
                        qb.update = jest.fn((data) => {
                            const toUpdate = applyFilters();
                            toUpdate.forEach(item => {
                                const index = mockDatabase[table].findIndex((i) => i.id === item.id);
                                if (index > -1) {
                                    mockDatabase[table][index] = {
                                        ...mockDatabase[table][index],
                                        ...data,
                                        updated_at: new Date().toISOString()
                                    };
                                }
                            });
                            const updated = toUpdate.map(item => ({
                                ...item,
                                ...data,
                                updated_at: new Date().toISOString()
                            }));
                            currentQuery = updated;
                            const updateQb = createQueryBuilder();
                            updateQb.then = jest.fn((resolve) => {
                                return resolve({ data: updated, error: null, count: updated.length });
                            });
                            return updateQb;
                        });
                        qb.delete = jest.fn(() => {
                            const toDelete = applyFilters();
                            toDelete.forEach(item => {
                                const index = mockDatabase[table].findIndex((i) => i.id === item.id);
                                if (index > -1) {
                                    mockDatabase[table].splice(index, 1);
                                }
                            });
                            currentQuery = toDelete;
                            const deleteQb = createQueryBuilder();
                            deleteQb.then = jest.fn((resolve) => {
                                return resolve({ data: toDelete, error: null, count: toDelete.length });
                            });
                            return deleteQb;
                        });
                        return qb;
                    };
                    return createQueryBuilder();
                })
            };
        })
    };
});
global.beforeEach(() => {
    mockDatabase.categories = [];
    mockDatabase.transactions = [];
    mockDatabase.budgets = [];
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00.000Z'));
});
global.afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
});
function resetMockDatabase() {
    mockDatabase.categories = [];
    mockDatabase.transactions = [];
    mockDatabase.budgets = [];
}
//# sourceMappingURL=setup.js.map