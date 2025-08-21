export declare const mockSupabaseClient: {
    from: jest.Mock<any, any, any>;
    select: jest.Mock<any, any, any>;
    insert: jest.Mock<any, any, any>;
    update: jest.Mock<any, any, any>;
    delete: jest.Mock<any, any, any>;
    eq: jest.Mock<any, any, any>;
    neq: jest.Mock<any, any, any>;
    gt: jest.Mock<any, any, any>;
    gte: jest.Mock<any, any, any>;
    lt: jest.Mock<any, any, any>;
    lte: jest.Mock<any, any, any>;
    like: jest.Mock<any, any, any>;
    ilike: jest.Mock<any, any, any>;
    is: jest.Mock<any, any, any>;
    in: jest.Mock<any, any, any>;
    order: jest.Mock<any, any, any>;
    range: jest.Mock<any, any, any>;
    limit: jest.Mock<any, any, any>;
    single: jest.Mock<any, any, any>;
    execute: jest.Mock<any, any, any>;
};
export declare const resetMocks: () => void;
export declare const mockRepositoryResponse: <T>(data: T | null, error?: any, count?: number) => {
    data: T | null;
    error: any;
};
//# sourceMappingURL=mockSupabase.d.ts.map