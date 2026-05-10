const shouldDropKey = key => key.startsWith("$") || key.includes(".");

const sanitizeValue = value => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.entries(value).reduce((clean, [key, child]) => {
    if (!shouldDropKey(key)) {
      clean[key] = sanitizeValue(child);
    }

    return clean;
  }, {});
};

const replaceObject = (target, clean) => {
  if (!target || typeof target !== "object") return;

  for (const key of Object.keys(target)) {
    delete target[key];
  }

  Object.assign(target, clean);
};

const sanitizeRequest = (req, res, next) => {
  replaceObject(req.body, sanitizeValue(req.body));
  replaceObject(req.params, sanitizeValue(req.params));
  replaceObject(req.query, sanitizeValue(req.query));
  next();
};

module.exports = sanitizeRequest;
