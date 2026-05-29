const test = require('node:test');
const assert = require('node:assert/strict');

// Prevent database initialization during tests
process.env.AUTO_INIT_DB = 'false';

const { sendResponse } = require('../helpers/payloadHelper');

test('sendResponse sends success response with status < 400', () => {
  const mockRes = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    send: function(data) {
      this.sentData = data;
      return this;
    }
  };

  sendResponse(mockRes, 200, { message: 'Success' });

  assert.equal(mockRes.statusCode, 200);
  assert.equal(mockRes.sentData.success, true);
  assert.deepEqual(mockRes.sentData.data, { message: 'Success' });
});

test('sendResponse sends error response with status >= 400', () => {
  const mockRes = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    send: function(data) {
      this.sentData = data;
      return this;
    }
  };

  sendResponse(mockRes, 400, { error: 'Bad Request' });

  assert.equal(mockRes.statusCode, 400);
  assert.equal(mockRes.sentData.success, false);
  assert.deepEqual(mockRes.sentData.data, { error: 'Bad Request' });
});

test('sendResponse handles empty data object', () => {
  const mockRes = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    send: function(data) {
      this.sentData = data;
      return this;
    }
  };

  sendResponse(mockRes, 201);

  assert.equal(mockRes.statusCode, 201);
  assert.equal(mockRes.sentData.success, true);
  assert.deepEqual(mockRes.sentData.data, {});
});

// Made with Bob