const success = (res, data = null, message = "OK", statusCode = 200, meta = null) => {
  const body = {
    success: true,
    message,
    data,
  };

  if (meta) body.meta = meta;

  return res.status(statusCode).json(body);
};

const created = (res, data = null, message = "Created") => {
  return success(res, data, message, 201);
};

const noContent = res => {
  return res.status(204).send();
};

module.exports = {
  success,
  created,
  noContent,
};
