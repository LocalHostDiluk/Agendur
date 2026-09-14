import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "*.pw.ts",
  use: { baseURL: "http://127.0.0.1:3107", browserName: "chromium", channel: "chrome" },
  webServer: {
    command: "bun run dev --hostname 127.0.0.1 --port 3107",
    url: "http://127.0.0.1:3107/register",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
