module.exports.successResponse = (res, status, message, data, error) => {
  res.status(status).send({
    success: true,
    message,
    data,
  });
};

module.exports.errorResponse = (res, status, message, data, error) => {
  res.status(status).send({
    success: false,
    message,
    data,
  });
};
