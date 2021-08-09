module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ]
    rules: {
        'prettier/prettier': 'error',
        'no-console': 0,
        'require-atomic-updates': 0
    }
};
