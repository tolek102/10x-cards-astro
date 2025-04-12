import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["src/lib/services/__tests__/setup.ts"],
    include: ["src/**/*.test.ts"],
    env: {
      SUPABASE_URL: "http://localhost:54321",
      SUPABASE_KEY: "test-key-for-testing-purposes-only",
    },
  },
});
