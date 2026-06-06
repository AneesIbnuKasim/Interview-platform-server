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

const createKey = (userId, mimeType) => {
  const id = crypto.randomBytes(16).toString("hex");
  const extension = extensionByMimeType[mimeType] || ".bin";

  return path.posix.join(
    "avatars",
    String(userId),
    `${Date.now()}-${id}${extension}`
  );
};

const save = async ({ userId, file }) => {
  const key = createKey(userId, file.mimetype);
  const absolutePath = path.resolve(env.uploads.root, key);

  console.log("uploads root:", env.uploads.root);
  console.log("absolute path:", absolutePath);
  console.log("cwd:", process.cwd());

  // Creates uploads, avatars, user folder, etc. if missing
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });

  await fs.writeFile(absolutePath, file.buffer, {
    flag: "wx",
  });

  return {
    key,
    url: `${normalizeBaseUrl(env.uploads.publicBaseUrl)}/${key}`,
  };
};

const remove = async (key) => {
  const absoluteRoot = path.resolve(env.uploads.root);
  const absolutePath = path.resolve(absoluteRoot, key);

  if (!absolutePath.startsWith(`${absoluteRoot}${path.sep}`)) {
    return {
      removed: false,
      skipped: true,
      reason: "INVALID_KEY",
    };
  }

  try {
    await fs.rm(absolutePath);

    return {
      removed: true,
      skipped: false,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        removed: false,
        skipped: true,
        reason: "NOT_FOUND",
      };
    }

    throw error;
  }
};

module.exports = {
  save,
  remove,
};