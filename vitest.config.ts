import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest config scoped to the pure, framework-free domain core. These tests have
 * no DOM/Next/Supabase dependencies, so they run fast in a plain node environment.
 */
export default defineConfig({
  resolve: {
    // Mirror the tsconfig "@/*" path alias so domain modules can import each
    // other the same way they do in the app.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["lib/**/__tests__/**/*.test.ts"],
  },
});
