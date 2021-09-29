/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/helpers/errorHandler.ts',
        '!src/helpers/routeHandler.ts',
        '!src/express.ts',
        '!src/notifier.ts',
        '!src/helpers/notify.ts',
        '!src/passport.ts',
        '!src/index.ts',
        '!src/routes/*.ts'
    ],
    globalSetup: './test/globalSetup.ts',
    globalTeardown: './test/globalTeardown.ts'
};
