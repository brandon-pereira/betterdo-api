/**
 * Inspired by watson-developer-cloud/node-sdk
 */
module.exports = {
    env: {
        node: true,
        es6: true
    },
    plugins: ['prettier'],
    parser: 'babel-eslint',
    extends: 'eslint:recommended',
    rules: {
        'prettier/prettier': 'error',
        'no-console': 0
    }
};
