config = {
  globals: {
    __REDWOOD__: true,
    __REDWOOD__API_PROXY_PATH: '/',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['fixtures', '__fixtures__'],
}

module.exports = config
