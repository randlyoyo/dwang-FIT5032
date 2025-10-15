module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-undef': 'off',
  },
  globals: {
    require: 'readonly',
    module: 'readonly',
    exports: 'readonly',
    process: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    console: 'readonly',
  },
}
