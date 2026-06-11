module.exports = {
  extends: ["@cybozu", "@cybozu/eslint-config/globals/kintone"],
  plugins: ["prefer-arrow"],
  rules: {
    "quotes": ["error", "double"],
    "max-depth": ["error", 6],
    "vars-on-top": "off",
    "no-var": "error",
    "max-statements": ["warn", 200],
    "object-curly-spacing": ["error", "always"],
    "strict": ["error", "global"],
    "prefer-arrow/prefer-arrow-functions": [
      "warn",
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false
      }
    ],
    "require-await": "warn",
    "id-length": ["error", { min: 2, exceptions: ["i", "j", "k", "l", "x", "y", "z"] }]
  },
  parserOptions: {
    ecmaVersion: 8
  },
  globals: {
    Swal: "readonly",
    Kuc: "readonly",
    luxon: "readonly"
  }
};
