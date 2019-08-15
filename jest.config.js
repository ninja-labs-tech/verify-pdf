module.exports = {
    verbose: true,
    testEnvironment: 'node',
    moduleFileExtensions: [
        'js',
        'json',
        'node',
    ],
    testRegex: '(/__tests__/.*|\\.test)\\.js$',
    testPathIgnorePatterns: [
        'node_modules',
    ],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'lib/**/*.js',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
    ],
};
