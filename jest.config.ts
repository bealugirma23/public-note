
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './', // Path to your Next.js app
})

const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
}

export default createJestConfig(config)
