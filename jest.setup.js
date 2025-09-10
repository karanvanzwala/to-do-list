import "@testing-library/jest-dom";

// Mock environment variables for testing
process.env.JWT_SECRET = "test_jwt_secret_key";
process.env.DB_HOST = "localhost";
process.env.DB_USER = "test_user";
process.env.DB_PASSWORD = "test_password";
process.env.DB_NAME = "test_db";
process.env.DB_PORT = "3306";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
