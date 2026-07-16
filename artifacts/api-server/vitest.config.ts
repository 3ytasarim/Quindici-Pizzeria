import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      ADMIN_USERNAME: "testadmin",
      ADMIN_PASSWORD: "testpass123",
      LOGIN_MAX_ATTEMPTS: "5",
      LOGIN_WINDOW_MS: "60000",
      LOGIN_LOCKOUT_MS: "30000",
    },
  },
});
