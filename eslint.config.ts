import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: ".",
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      "react-hooks": reactHooksPlugin,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    rules: {
      ...tsPlugin.configs.strict.rules,
      ...tsPlugin.configs["recommended-requiring-type-checking"].rules,
      ...tsPlugin.configs.stylistic.rules,
      ...reactPlugin.configs.recommended.rules,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  prettierRecommended,
];
