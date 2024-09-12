module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "indent": "off",
    "quotes": "off",
    "object-curly-spacing": "off",
    "no-multi-spaces": "off",
    "quote-props": "off",
    "max-len": ["error", { "code": 120 }],
    "no-html-link-for-pages": "off",
    "comma-dangle": ["error", "always-multiline"],
    "eol-last": "off",
  },
  ignorePatterns: ["**/pages/**", "**/src/pages/**"], // Next.js pages 디렉토리 무시
};