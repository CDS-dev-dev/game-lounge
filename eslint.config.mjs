import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".ui-audit/**",
    ".vercel/**",
    "coverage/**",
    "node_modules/**",
    "out/**",
    "build/**",
    "app/generated/prisma/**",
    "scripts/**/*.js",
    "test-*.js",
    "test-browser*.js",
    "jest.config.js",
    "next-env.d.ts",
    "*.tsbuildinfo",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "prefer-const": "warn",
      "react-hooks/error-boundaries": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
