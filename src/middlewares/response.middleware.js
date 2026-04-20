const buildResponse = ({ status = 200, success = true, errors = null, method, response }) => ({
  status,
  success,
  errors,
  method,
  response,
});

const sendSuccess = (res, method, response, status = 200) => {
  res.status(status).json(buildResponse({ status, success: true, errors: null, method, response }));
};

const sendError = (res, method, errors, status = 400) => {
  res.status(status).json(buildResponse({ status, success: false, errors, method, response: null }));
};

module.exports = { sendSuccess, sendError };
