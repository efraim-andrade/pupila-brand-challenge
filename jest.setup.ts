import '@testing-library/jest-dom';

// Mock nanoid to avoid ESM parsing issues in Jest
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id'),
}));
