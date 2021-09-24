module.exports = {
    plugins: ['jest'],
    extends: ['plugin:jest/recommended'],
    rules: {
        'jest/no-try-expect': 'warn',
        'jest/no-conditional-expect': 'warn',
        '@typescript-eslint/no-explicit-any': 'off'
    }
};
