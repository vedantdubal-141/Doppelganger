const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle specific MySQL Database Errors
  if (err.code && err.code.startsWith('ER_')) {
    statusCode = 500;
    message = `Database Error: ${err.message}`;
  }

  res.status(statusCode);
  res.json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
