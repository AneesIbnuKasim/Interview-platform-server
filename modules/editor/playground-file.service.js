const PlaygroundFile = require("../../models/PlaygroundFile");
const { ConflictError, NotFoundError } = require("../../util/errors");

const normalizeName = (name) => name.trim();

const duplicateNameError = () => {
  return new ConflictError("A playground file with this name already exists");
};

const listFiles = async (user) => {
  const files = await PlaygroundFile.find({ owner: user._id }).sort({
    updatedAt: -1,
  });

  return {
    files: files.map((file) => file.toClient()),
  };
};

const createFile = async (payload, user) => {
  try {
    const file = await PlaygroundFile.create({
      owner: user._id,
      name: normalizeName(payload.name),
      language: payload.language,
      code: payload.code || "",
      stdin: payload.stdin || "",
      lastOpenedAt: new Date(),
    });

    return { file: file.toClient() };
  } catch (error) {
    if (error.code === 11000) {
      throw duplicateNameError();
    }

    throw error;
  }
};

const findOwnedFile = async (fileId, user) => {
  const file = await PlaygroundFile.findOne({
    _id: fileId,
    owner: user._id,
  });

  if (!file) {
    throw new NotFoundError("Playground file not found");
  }

  return file;
};

const updateFile = async (fileId, payload, user) => {
  const file = await findOwnedFile(fileId, user);

  if (payload.name !== undefined) {
    file.name = normalizeName(payload.name);
  }

  if (payload.language !== undefined) {
    file.language = payload.language;
  }

  if (payload.code !== undefined) {
    file.code = payload.code;
  }

  if (payload.stdin !== undefined) {
    file.stdin = payload.stdin;
  }

  try {
    await file.save();
    return { file: file.toClient() };
  } catch (error) {
    if (error.code === 11000) {
      throw duplicateNameError();
    }

    throw error;
  }
};

const openFile = async (fileId, user) => {
  const file = await findOwnedFile(fileId, user);
  file.lastOpenedAt = new Date();
  await file.save();

  return { file: file.toClient() };
};

module.exports = {
  createFile,
  listFiles,
  openFile,
  updateFile,
};
