const { ValidationError } = require("../util/errors");

const formatDetails = details => {
  return details.map(detail => ({
    field: detail.path.join("."),
    message: detail.message,
  }));
};

const validate = schemaMap => (req, res, next) => {
  const targets = ["body", "query", "params"];

  for (const target of targets) {
    const schema = schemaMap[target];
    if (!schema) continue;

    const { value, error } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return next(new ValidationError(formatDetails(error.details)));
    }

    req[target] = value;
  }

  return next();
};

module.exports = validate;
