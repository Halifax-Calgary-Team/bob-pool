const sendResponse = (res, status, data = {}) => {
  return res
    .status(status)
    .send(Object.assign({}, { success: Boolean(status < 400), data }));
};

module.exports = { sendResponse };
