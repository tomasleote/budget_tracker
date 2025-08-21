import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for testing
export const mockSupabaseClient = {
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

// Mock the Supabase createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

export const resetMocks = () => {
  Object.values(mockSupabaseClient).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear();
    }
  });
};

export const mockRepositoryResponse = <T>(data: T | null, error: any = null, count?: number) => {
  const response = { data, error };
  if (count !== undefined) {
    (response as any).count = count;
  }
  return response;
};