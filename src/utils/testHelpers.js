// Testing utilities and helpers
// This demonstrates proper testing setup and mocking strategies

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';

// Mock Supabase client for testing
export const createMockSupabaseClient = () => {
  const mockData = {
    questions: [
      {
        id: 1,
        text: 'Test question 1',
        votes: 5,
        answered: false,
        created_at: '2025-01-01T00:00:00Z',
        session_id: 'test-session'
      },
      {
        id: 2,
        text: 'Test question 2',
        votes: 3,
        answered: true,
        created_at: '2025-01-02T00:00:00Z',
        session_id: 'test-session'
      }
    ],
    sessions: [
      {
        id: 'test-session',
        name: 'Test Session',
        created_at: '2025-01-01T00:00:00Z'
      }
    ]
  };

  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockData.questions[0], error: null }),

    // Mock successful responses
    mockSuccess: (data) => ({
      data,
      error: null
    }),

    // Mock error responses
    mockError: (message) => ({
      data: null,
      error: { message }
    }),

    // Mock real-time subscription
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({
        unsubscribe: jest.fn()
      })
    }),

    // Mock RPC calls
    rpc: jest.fn().mockResolvedValue({ data: { success: true, new_vote_count: 6 }, error: null })
  };
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    // initialEntries = ['/'], // Removed unused parameter
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired
  };

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
};

// Mock localStorage for testing
export const mockLocalStorage = () => {
  const store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
};

// Mock console methods to reduce test noise
export const mockConsole = () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};

// Test data factories
export const createTestQuestion = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  text: 'Test question text',
  votes: 0,
  answered: false,
  created_at: new Date().toISOString(),
  session_id: 'test-session',
  anonymous: false,
  ...overrides
});

export const createTestSession = (overrides = {}) => ({
  id: 'test-session',
  name: 'Test Session',
  created_at: new Date().toISOString(),
  ...overrides
});

// Custom matchers for better assertions
export const customMatchers = {
  toBeValidQuestion: (received) => {
    const requiredFields = ['id', 'text', 'votes', 'answered', 'created_at'];
    const missingFields = requiredFields.filter(field => !(field in received));

    if (missingFields.length > 0) {
      return {
        message: () => `Expected question to have fields: ${missingFields.join(', ')}`,
        pass: false
      };
    }

    if (typeof received.text !== 'string' || received.text.length === 0) {
      return {
        message: () => 'Expected question text to be a non-empty string',
        pass: false
      };
    }

    if (typeof received.votes !== 'number' || received.votes < 0) {
      return {
        message: () => 'Expected votes to be a non-negative number',
        pass: false
      };
    }

    return {
      message: () => 'Question is valid',
      pass: true
    };
  }
};

// Async testing helpers
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

export const waitForErrorToAppear = async (errorText) => {
  await waitFor(() => {
    expect(screen.getByText(errorText)).toBeInTheDocument();
  });
};

// Form testing helpers
export const fillForm = async (user, formData) => {
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    await user.clear(field);
    await user.type(field, value);
  }
};

export const submitForm = async (user, buttonText = /submit/i) => {
  const submitButton = screen.getByRole('button', { name: buttonText });
  await user.click(submitButton);
};

// Network request mocking
export const mockNetworkError = () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
};

export const mockSuccessfulResponse = (data) => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(data)
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
};

// Performance testing helpers
export const measureRenderTime = (component) => {
  const start = performance.now();
  const result = render(component);
  const end = performance.now();

  return {
    ...result,
    renderTime: end - start
  };
};

// Accessibility testing helpers
export const checkAccessibility = async (container) => {
  const { axe, toHaveNoViolations } = await import('jest-axe');
  expect.extend(toHaveNoViolations);

  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Component testing utilities
export const getByTestId = (testId) => screen.getByTestId(testId);
export const queryByTestId = (testId) => screen.queryByTestId(testId);
export const findByTestId = (testId) => screen.findByTestId(testId);

// Error boundary testing
export const ThrowError = ({ shouldThrow, children }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return children;
};

// Mock timers helpers
export const setupMockTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));
};

const testHelpers = {
  createMockSupabaseClient,
  renderWithProviders,
  mockLocalStorage,
  mockConsole,
  createTestQuestion,
  createTestSession,
  customMatchers,
  waitForLoadingToFinish,
  waitForErrorToAppear,
  fillForm,
  submitForm,
  mockNetworkError,
  mockSuccessfulResponse,
  measureRenderTime,
  checkAccessibility,
  ThrowError,
  setupMockTimers,
  setupTestEnvironment
};

export default testHelpers;
