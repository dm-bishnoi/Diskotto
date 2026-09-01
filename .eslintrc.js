module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier", // Disables ESLint rules that conflict with Prettier
  ],
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],

    // React rules
    "react/react-in-jsx-scope": "off",
    "react/display-name": "off",

    // Next.js rules
    "@next/next/no-html-link-for-pages": "error",
  },
  ignorePatterns: [
    "node_modules",
    ".next",
    "out",
    "dist",
    "build",
    "coverage",
    "*.config.js",
    "*.config.ts",
  ],
};
