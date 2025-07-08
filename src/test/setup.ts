import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js environment variables
process.env.DRUPAL_URL = 'https://test-drupal.example.com'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}