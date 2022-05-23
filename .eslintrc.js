module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-use-before-define': 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
  },
};
