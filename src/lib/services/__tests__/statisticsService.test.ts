import { describe, it, expect, vi, beforeEach } from "vitest";
import { StatisticsService } from "../statisticsService";
import { createMockSupabaseClient } from "./setup";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

describe("StatisticsService", () => {
  const mockSupabase = createMockSupabaseClient();
  let service: StatisticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StatisticsService(mockSupabase);
  });

  describe("trackFlashcardsGeneration", () => {
    it("should update statistics successfully", async () => {
      const mockResponse = {
        data: null,
        error: null,
      };

      const expectedData = {
        user_id: DEFAULT_USER_ID,
        generated_count: 5,
        accepted_edited_count: 0,
        accepted_unedited_count: 0,
      };

      const mockFrom = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue(mockResponse),
      });
      mockSupabase.from = mockFrom;

      await service.trackFlashcardsGeneration(DEFAULT_USER_ID, 5);

      expect(mockSupabase.from).toHaveBeenCalledWith("statistics");
      expect(mockFrom().upsert).toHaveBeenCalledWith(expectedData, {
        onConflict: "user_id",
      });
    });

    it("should throw error when database operation fails", async () => {
      const mockError = new Error("Database error");
      const mockResponse = {
        data: null,
        error: mockError,
      };

      const mockFrom = vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue(mockResponse),
      });
      mockSupabase.from = mockFrom;

      await expect(service.trackFlashcardsGeneration(DEFAULT_USER_ID, 5)).rejects.toThrow(
        "Failed to update statistics"
      );
    });
  });
});
