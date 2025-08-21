export declare const testSupabase: {
    from: (table: string) => {
        select: () => any;
        insert: (data: any) => any;
        update: (data: any) => any;
        delete: () => any;
        eq: (column: string, value: any) => any;
        neq: (column: string, value: any) => any;
        is: (column: string, value: any) => any;
        not: (column: string, operator: string, value: any) => any;
        single: () => Promise<{
            data: any;
            error: null;
        }>;
        then: (resolve: any) => Promise<any>;
    };
};
export declare function setupTestDatabase(): Promise<void>;
export declare function cleanupTestDatabase(): Promise<void>;
export declare function resetMockDatabase(): void;
export declare function verifyTestDatabaseConnection(): Promise<boolean>;
export declare function seedDefaultCategoriesData(): void;
//# sourceMappingURL=database.d.ts.map