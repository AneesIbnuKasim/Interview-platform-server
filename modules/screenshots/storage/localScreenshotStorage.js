const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const env = require("../../../config/env");

const extensionByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const normalizeBaseUrl = (baseUrl) => baseUrl.replace(/\/$/, "");

const createKey = (roomCode, mimeType) => {
  const id = crypto.randomBytes(16).toString("hex");
  const extension = extensionByMimeType[mimeType] || ".bin";
  return path.posix.join(
    "screenshots",
    roomCode,
    `${Date.now()}-${id}${extension}`,
  );
};

const save = async ({ roomCode, file }) => {
  const key = createKey(roomCode, file.mimetype);
  const absolutePath = path.join(env.uploads.root, key);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, file.buffer, { flag: "wx" });

  return {
    key,
    url: `${normalizeBaseUrl(env.uploads.publicBaseUrl)}/${key}`,
  };
};

module.exports = {
  save,
};
