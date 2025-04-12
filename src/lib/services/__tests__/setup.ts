import { vi, beforeEach } from "vitest";
import type { SupabaseClient } from "../../../db/supabase.client";

interface MockSupabaseResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

interface PostgrestBuilder {
  select: (columns?: string) => PostgrestBuilder;
  single: () => Promise<MockSupabaseResponse>;
  insert: (data: unknown) => PostgrestBuilder;
  eq: (column: string, value: unknown) => PostgrestBuilder;
  neq: (column: string, value: unknown) => PostgrestBuilder;
  gt: (column: string, value: unknown) => PostgrestBuilder;
  lt: (column: string, value: unknown) => PostgrestBuilder;
  gte: (column: string, value: unknown) => PostgrestBuilder;
  lte: (column: string, value: unknown) => PostgrestBuilder;
  like: (column: string, value: string) => PostgrestBuilder;
  ilike: (column: string, value: string) => PostgrestBuilder;
  is: (column: string, value: unknown) => PostgrestBuilder;
  in: (column: string, values: unknown[]) => PostgrestBuilder;
  contains: (column: string, value: unknown) => PostgrestBuilder;
  containedBy: (column: string, value: unknown) => PostgrestBuilder;
  range: (column: string, range: [unknown, unknown]) => PostgrestBuilder;
  match: (query: object) => PostgrestBuilder;
  not: (column: string, value: unknown) => PostgrestBuilder;
  or: (query: string, values?: unknown[]) => PostgrestBuilder;
  filter: (column: string, operator: string, value: unknown) => PostgrestBuilder;
}

// Mock the entire supabase.client module
vi.mock("../../../db/supabase.client", () => ({
  supabaseClient: createMockSupabaseClient(),
  DEFAULT_USER_ID: "test-user-id",
}));

// Mock Supabase client for testing
export const createMockSupabaseClient = () => {
  const createBuilder = (): PostgrestBuilder => {
    const builder = {
      select: () => builder,
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: () => builder,
      eq: () => builder,
      neq: () => builder,
      gt: () => builder,
      lt: () => builder,
      gte: () => builder,
      lte: () => builder,
      like: () => builder,
      ilike: () => builder,
      is: () => builder,
      in: () => builder,
      contains: () => builder,
      containedBy: () => builder,
      range: () => builder,
      match: () => builder,
      not: () => builder,
      or: () => builder,
      filter: () => builder,
    };
    return builder;
  };

  const mockSupabase = {
    from: () => createBuilder(),
  } as unknown as SupabaseClient;

  return mockSupabase;
};

// Mock console methods to prevent noise in test output
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
