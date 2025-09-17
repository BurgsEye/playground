// Test setup file
// Only load dotenv in test environment
if (process.env.NODE_ENV === 'test') {
  try {
    const { config } = require('dotenv');
    config({ path: '.env.local' });
  } catch (error) {
    // dotenv not available, continue without it
    console.warn('dotenv not available, using environment variables as-is');
  }
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
// process.env.NODE_ENV = 'test'; // Read-only property
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
