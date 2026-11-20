import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Safari before iOS 16.4 can't parse lookbehind in a regex and rejects the whole script bundle,
    // which left every invite's text invisible on older iPhones. Use splitAfter (src/lib/format.ts).
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/pdf/**", "src/app/api/**", "scripts/**"],
    rules: {
      "no-restricted-syntax": ["error", { selector: "Literal[regex.pattern=/\\(\\?<[=!]/]", message: "No regex lookbehind: older iPhones can't parse it. Use splitAfter from @/lib/format." }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
