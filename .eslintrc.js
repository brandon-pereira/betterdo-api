/**
 * Inspired by watson-developer-cloud/node-sdk
 */
module.exports = {
    env: {
        node: true,
        es6: true
    },
    plugins: ['prettier'],
    extends: 'eslint:recommended',
    rules: {
        'prettier/prettier': 'error',
        'no-console': 0,
        'require-atomic-updates': 0
    },
    parserOptions: {
        // Required for certain syntax usages
        ecmaVersion: 2018
    }
};
