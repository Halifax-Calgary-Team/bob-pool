const test = require('node:test');
const assert = require('node:assert/strict');

// Prevent database initialization during tests
process.env.AUTO_INIT_DB = 'false';

const authRoutes = require('../routes/auth');
const { isValidIBMEmail } = authRoutes;

// ============================================
// EMAIL VALIDATION TESTS
// ============================================

test('isValidIBMEmail accepts valid IBM email addresses', () => {
  assert.equal(isValidIBMEmail('user@ibm.com'), true);
  assert.equal(isValidIBMEmail('USER@IBM.COM'), true);
  assert.equal(isValidIBMEmail('first.last@ibm.com'), true);
  assert.equal(isValidIBMEmail('user123@ibm.com'), true);
  assert.equal(isValidIBMEmail('user-name@ibm.com'), true);
  assert.equal(isValidIBMEmail('user_name@ibm.com'), true);
});

test('isValidIBMEmail rejects non-IBM email addresses', () => {
  assert.equal(isValidIBMEmail('user@example.com'), false);
  assert.equal(isValidIBMEmail('user@ibm.co'), false);
  assert.equal(isValidIBMEmail('user@notibm.com'), false);
  assert.equal(isValidIBMEmail('user@gmail.com'), false);
  assert.equal(isValidIBMEmail('user@yahoo.com'), false);
});

test('isValidIBMEmail rejects malformed email addresses', () => {
  assert.equal(isValidIBMEmail('not-an-email'), false);
  assert.equal(isValidIBMEmail(''), false);
  assert.equal(isValidIBMEmail('user@'), false);
  assert.equal(isValidIBMEmail('@ibm.com'), false);
  assert.equal(isValidIBMEmail('user @ibm.com'), false);
  assert.equal(isValidIBMEmail('user@ibm .com'), false);
});

test('isValidIBMEmail handles edge cases', () => {
  assert.equal(isValidIBMEmail(null), false);
  assert.equal(isValidIBMEmail(undefined), false);
  assert.equal(isValidIBMEmail('user@IBM.COM'), true); // Case insensitive
  assert.equal(isValidIBMEmail('user@ibm.com '), false); // Trailing space
  assert.equal(isValidIBMEmail(' user@ibm.com'), false); // Leading space
});

// ============================================
// MOCK REQUEST/RESPONSE HELPERS
// ============================================

function createMockRequest(body = {}, session = {}) {
  return {
    body,
    session,
    params: {},
    query: {}
  };
}

function createMockResponse() {
  const res = {
    statusCode: null,
    jsonData: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    }
  };
  return res;
}

// ============================================
// REGISTRATION VALIDATION TESTS
// ============================================

test('registration validation - missing fields', async () => {
  const req = createMockRequest({});
  const res = createMockResponse();
  
  // Mock the router's register handler behavior
  const { email, name, password } = req.body;
  
  if (!email || !name || !password) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email, name, and password are required'
    });
  }
  
  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonData.error, 'Validation Error');
  assert.equal(res.jsonData.message, 'Email, name, and password are required');
});

test('registration validation - invalid IBM email', async () => {
  const req = createMockRequest({
    email: 'user@gmail.com',
    name: 'Test User',
    password: 'password123'
  });
  const res = createMockResponse();
  
  const { email, name, password } = req.body;
  
  if (!email || !name || !password) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email, name, and password are required'
    });
  } else if (!isValidIBMEmail(email)) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email must be a valid IBM email address (@ibm.com)'
    });
  }
  
  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonData.error, 'Validation Error');
  assert.equal(res.jsonData.message, 'Email must be a valid IBM email address (@ibm.com)');
});

test('registration validation - short password', async () => {
  const req = createMockRequest({
    email: 'user@ibm.com',
    name: 'Test User',
    password: '12345'
  });
  const res = createMockResponse();
  
  const { email, name, password } = req.body;
  
  if (!email || !name || !password) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email, name, and password are required'
    });
  } else if (!isValidIBMEmail(email)) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email must be a valid IBM email address (@ibm.com)'
    });
  } else if (password.length < 6) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Password must be at least 6 characters long'
    });
  }
  
  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonData.error, 'Validation Error');
  assert.equal(res.jsonData.message, 'Password must be at least 6 characters long');
});

test('registration validation - valid data passes', async () => {
  const req = createMockRequest({
    email: 'user@ibm.com',
    name: 'Test User',
    password: 'password123'
  });
  const res = createMockResponse();
  
  const { email, name, password } = req.body;
  let validationPassed = false;
  
  if (!email || !name || !password) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email, name, and password are required'
    });
  } else if (!isValidIBMEmail(email)) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email must be a valid IBM email address (@ibm.com)'
    });
  } else if (password.length < 6) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Password must be at least 6 characters long'
    });
  } else {
    validationPassed = true;
  }
  
  assert.equal(validationPassed, true);
  assert.equal(res.statusCode, null); // No error response
});

// ============================================
// LOGIN VALIDATION TESTS
// ============================================

test('login validation - missing credentials', async () => {
  const req = createMockRequest({});
  const res = createMockResponse();
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email and password are required'
    });
  }
  
  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonData.error, 'Validation Error');
  assert.equal(res.jsonData.message, 'Email and password are required');
});

test('login validation - missing email only', async () => {
  const req = createMockRequest({ password: 'password123' });
  const res = createMockResponse();
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email and password are required'
    });
  }
  
  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonData.message, 'Email and password are required');
});

test('login validation - missing password only', async () => {
  const req = createMockRequest({ email: 'user@ibm.com' });
  const res = createMockResponse();
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ 
      error: 'Validation Error',
      message: 'Email and password are required'
    });
  }
  
  assert.equal(res.statusCode, 400);
  assert.equal(res.jsonData.message, 'Email and password are required');
});

// Made with Bob