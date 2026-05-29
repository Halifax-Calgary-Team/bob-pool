# Testing Guide

This document provides comprehensive information about the testing infrastructure for the Bob Pool application.

## Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)

## Overview

Bob Pool uses a comprehensive testing strategy with:

- **Backend**: Node.js built-in test runner with c8 for coverage
- **Frontend**: Vitest with React Testing Library for component testing
- **Coverage Reporting**: HTML reports with visualization for both backend and frontend

## Backend Testing

### Framework & Tools

- **Test Runner**: Node.js built-in `node:test`
- **Assertion Library**: Node.js built-in `node:assert/strict`
- **Coverage Tool**: c8 (v8 coverage)

### Test Structure

```
backend/
├── test/
│   ├── validation.test.js      # Original validation tests
│   ├── helpers.test.js         # Helper function tests
│   ├── auth-routes.test.js     # Authentication route tests
│   └── ride-routes.test.js     # Ride route tests
├── .c8rc.json                  # Coverage configuration
└── package.json                # Test scripts
```

### Running Backend Tests

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests and save output to log file
npm run test:log

# Run tests with coverage and save output to log file
npm run test:coverage:log
```

**Test Log Files**:
- `test-results.log` - Contains test execution output
- `test-coverage.log` - Contains test execution output with coverage report

### Backend Test Coverage

Coverage reports are generated in `backend/coverage/`:
- **HTML Report**: `backend/coverage/index.html` - Open in browser for visual coverage
- **Text Report**: Displayed in terminal
- **LCOV Report**: `backend/coverage/lcov.info` - For CI/CD integration

**Coverage Targets**:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### Backend Test Files

#### `validation.test.js`
Tests for email and ride data validation functions:
- IBM email format validation
- Ride data field validation
- Date and time format validation
- Seat count validation

#### `helpers.test.js`
Tests for helper utilities:
- `sendResponse()` function
- Success/error response formatting
- Status code handling

#### `auth-routes.test.js`
Tests for authentication logic:
- Email validation (IBM domain)
- Registration validation
- Login validation
- Password requirements
- Missing field detection

#### `ride-routes.test.js`
Tests for ride management:
- Ride data validation
- Seat count validation (1-10)
- Date format validation (YYYY-MM-DD)
- Time format validation (HH:MM 24-hour)
- Missing field detection
- Edge cases

## Frontend Testing

### Framework & Tools

- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **Assertion Library**: Vitest + @testing-library/jest-dom
- **Coverage Tool**: @vitest/coverage-v8
- **UI**: @vitest/ui for interactive test visualization

### Test Structure

```
frontend/
├── src/
│   ├── test/
│   │   ├── setup.js           # Test environment setup
│   │   └── test-utils.jsx     # Custom render utilities
│   ├── components/
│   │   └── Navbar.test.jsx    # Navbar component tests
│   ├── contexts/
│   │   └── AuthContext.test.jsx # Auth context tests
│   └── config/
│       └── api.test.js        # API configuration tests
├── vitest.config.js           # Vitest configuration
└── package.json               # Test scripts
```

### Running Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests with UI (interactive visualization)
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests and save output to log files
npm run test:log

# Run tests with coverage and save output to log file
npm run test:coverage:log
```

**Test Log Files**:
- `test-results.log` - Contains verbose test execution output
- `test-results.json` - Contains test results in JSON format
- `test-coverage.log` - Contains test execution output with coverage report

### Frontend Test Coverage

Coverage reports are generated in `frontend/coverage/`:
- **HTML Report**: `frontend/coverage/index.html` - Open in browser for visual coverage
- **Text Report**: Displayed in terminal
- **LCOV Report**: `frontend/coverage/lcov.info` - For CI/CD integration

### Frontend Test Files

#### `Navbar.test.jsx`
Tests for navigation component:
- Rendering authenticated/unauthenticated states
- Navigation link visibility
- User interaction (login, logout, navigation)
- Accessibility (ARIA labels)

#### `AuthContext.test.jsx`
Tests for authentication context:
- IBM SSO authentication flow
- Regular authentication fallback
- Logout functionality
- Loading states
- Error handling
- Network error handling

#### `api.test.js`
Tests for API configuration:
- URL building in development/production
- Environment variable handling
- Query parameter preservation
- Path normalization

## Running Tests

### Quick Start

```bash
# Run all backend tests
cd backend && npm test

# Run all frontend tests
cd frontend && npm test

# Run both with coverage
cd backend && npm run test:coverage
cd frontend && npm run test:coverage

# Run tests and save logs
cd backend && npm run test:log
cd frontend && npm run test:log
```

### Using Podman/Docker

```bash
# Backend tests in container
make test-backend

# Frontend tests in container
make test-frontend

# Or manually:
podman-compose run --rm backend npm test
podman-compose run --rm frontend npm test
```

## Test Coverage

### Viewing Coverage Reports

#### Backend Coverage
```bash
cd backend
npm run test:coverage
# Open backend/coverage/index.html in browser
```

#### Frontend Coverage
```bash
cd frontend
npm run test:coverage
# Open frontend/coverage/index.html in browser
```

### Coverage Reports Include

- **Line Coverage**: Percentage of code lines executed
- **Function Coverage**: Percentage of functions called
- **Branch Coverage**: Percentage of conditional branches taken
- **Statement Coverage**: Percentage of statements executed

### Test Log Files

Both backend and frontend can save test output to log files for later review or CI/CD integration.

**Backend Log Files**:
```bash
cd backend
npm run test:log              # Saves to test-results.log
npm run test:coverage:log     # Saves to test-coverage.log
```

**Frontend Log Files**:
```bash
cd frontend
npm run test:log              # Saves to test-results.log and test-results.json
npm run test:coverage:log     # Saves to test-coverage.log
```

**Log File Formats**:
- `.log` files: Human-readable text format with ANSI colors
- `.json` files: Machine-readable JSON format (frontend only)

**Use Cases**:
- Archive test results for compliance
- Compare test results over time
- Parse test results in CI/CD pipelines
- Debug test failures offline
- Share test results with team members

### Interactive Test UI (Frontend Only)

```bash
cd frontend
npm run test:ui
```

This opens an interactive web interface showing:
- Test results in real-time
- Test file structure
- Individual test status
- Console output
- Test duration
- Coverage visualization

## Writing Tests

### Backend Test Example

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');

// Prevent database initialization
process.env.AUTO_INIT_DB = 'false';

const { validateRideData } = require('../routes/rides');

test('validates ride data correctly', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 3
  });

  assert.equal(result, null); // null means valid
});
```

### Frontend Test Example

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<MyComponent onClick={handleClick} />);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Descriptions**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Don't make real API calls
5. **Test User Behavior**: Focus on what users do, not implementation
6. **Accessibility**: Test ARIA labels and keyboard navigation
7. **Edge Cases**: Test boundary conditions and error states

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests with coverage
        run: cd backend && npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run tests with coverage
        run: cd frontend && npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
          flags: frontend
```

## Troubleshooting

### Backend Tests

**Issue**: Tests fail with database connection errors
```bash
# Solution: Ensure AUTO_INIT_DB is set to false in tests
process.env.AUTO_INIT_DB = 'false';
```

**Issue**: Coverage reports not generating
```bash
# Solution: Install c8 and run with coverage flag
npm install --save-dev c8
npm run test:coverage
```

### Frontend Tests

**Issue**: Tests fail with "window is not defined"
```bash
# Solution: Ensure jsdom environment is configured in vitest.config.js
environment: 'jsdom'
```

**Issue**: React Testing Library queries not working
```bash
# Solution: Import from test-utils.jsx instead of @testing-library/react
import { render, screen } from '../test/test-utils';
```

**Issue**: Coverage UI not opening
```bash
# Solution: Install @vitest/ui
npm install --save-dev @vitest/ui
npm run test:ui
```

## Additional Resources

- [Node.js Test Runner Documentation](https://nodejs.org/api/test.html)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [c8 Coverage Tool](https://github.com/bcoe/c8)

## Summary

- **Backend**: 4 test files, 100+ test cases covering validation, helpers, and route logic
- **Frontend**: 3 test files, 50+ test cases covering components, contexts, and utilities
- **Coverage**: HTML reports with visualization for both backend and frontend
- **Interactive UI**: Vitest UI for real-time test visualization (frontend)
- **CI/CD Ready**: LCOV reports for integration with coverage services

---

Made with Bob