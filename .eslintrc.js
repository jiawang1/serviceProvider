module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es6: true
  },
  extends: ['eslint-config-airbnb', 'prettier'],
  parserOptions: {
    ecmaVersion: 8
  },
  plugins: ['prettier'],
  rules: {
    indent: 'off',
    'comma-dangle': ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'no-plusplus': 'off',
    'no-underscore-dangle': [0],
    'class-methods-use-this': 'off',
    'import/no-extraneous-dependencies': 'off',
    'react/forbid-prop-types': 'off',
    'global-require': 'off',
    semi: ['error', 'always'],
    'prettier/prettier': 'error',
    'no-debugger': 'warn',
    'linebreak-style': 0
  },
  root: true
};
