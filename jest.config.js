/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/helpers/errorHandler.js',
        '!src/helpers/routeHandler.js',
        '!src/express.js',
        '!src/notifier.js',
        '!src/helpers/notify.js',
        '!src/passport.js',
        '!src/routes/*.js'
    ]
};
