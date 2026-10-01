import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "booking-branches.pw.ts",
  use: {
    baseURL: "http://127.0.0.1:3000",
    browserName: "chromium",
    channel: "chrome",
  },
});
