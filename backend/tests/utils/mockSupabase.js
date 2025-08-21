"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRepositoryResponse = exports.resetMocks = exports.mockSupabaseClient = void 0;
exports.mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
    execute: jest.fn()
};
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => exports.mockSupabaseClient)
}));
const resetMocks = () => {
    Object.values(exports.mockSupabaseClient).forEach(mock => {
        if (typeof mock === 'function') {
            mock.mockClear();
        }
    });
};
exports.resetMocks = resetMocks;
const mockRepositoryResponse = (data, error = null, count) => {
    const response = { data, error };
    if (count !== undefined) {
        response.count = count;
    }
    return response;
};
exports.mockRepositoryResponse = mockRepositoryResponse;
//# sourceMappingURL=mockSupabase.js.map