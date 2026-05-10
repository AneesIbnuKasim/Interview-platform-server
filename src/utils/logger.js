const formatMeta = meta => {
  if (!meta || Object.keys(meta).length === 0) return "";
  return ` ${JSON.stringify(meta)}`;
};

const logger = {
  info(message, meta) {
    console.info(`[INFO] ${message}${formatMeta(meta)}`);
  },
  warn(message, meta) {
    console.warn(`[WARN] ${message}${formatMeta(meta)}`);
  },
  error(message, meta) {
    console.error(`[ERROR] ${message}${formatMeta(meta)}`);
  },
};

module.exports = logger;
