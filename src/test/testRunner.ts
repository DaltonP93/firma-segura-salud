
import { describe, it, expect } from 'vitest';

// Test suite runner for CI/CD integration
export const runTestSuite = async () => {
  try {
    console.log('🧪 Running Phase 4 Test Suite...');
    
    // Import all test files
    await Promise.all([
      import('./hooks/useSalesRequests.test'),
      import('./hooks/useNotifications.test'),
      import('./hooks/useOptimizedSearch.test'),
      import('./components/SearchInput.test'),
      import('./components/LazyWrapper.test'),
      import('./services/notificationsService.test'),
    ]);
    
    console.log('✅ All tests imported successfully');
    return true;
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return false;
  }
};

// Coverage configuration
export const testConfig = {
  coverage: {
    threshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    include: [
      'src/**/*.{ts,tsx}',
    ],
    exclude: [
      'src/test/**',
      'src/**/*.test.{ts,tsx}',
      'src/**/*.stories.{ts,tsx}',
      'src/main.tsx',
      'src/vite-env.d.ts',
    ],
  },
};
