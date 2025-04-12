import { vi, beforeEach } from "vitest";
import type { SupabaseClient } from "../../../db/supabase.client";

// Mock the entire supabase.client module
vi.mock("../../../db/supabase.client", () => ({
  supabaseClient: createMockSupabaseClient(),
  DEFAULT_USER_ID: "test-user-id",
}));

// Mock Supabase client for testing
export const createMockSupabaseClient = () => {
  const mockSelect = vi.fn().mockReturnValue({
    data: null,
    error: null,
    mockResolvedValueOnce: vi.fn(),
  });

  const mockInsert = vi.fn().mockReturnValue({
    select: mockSelect,
    mockResolvedValueOnce: vi.fn(),
  });

  const mockUpsert = vi.fn().mockReturnValue({
    mockResolvedValueOnce: vi.fn(),
  });

  const mockFrom = vi.fn().mockReturnValue({
    insert: mockInsert,
    upsert: mockUpsert,
    select: mockSelect,
  });

  const mockSupabase = {
    from: mockFrom,
  } as unknown as SupabaseClient;

  return mockSupabase;
};

// Mock console methods to prevent noise in test output
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
