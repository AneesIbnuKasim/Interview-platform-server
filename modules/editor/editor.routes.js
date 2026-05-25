const router = require("express").Router();
const editorController = require("./editor.controller");
const editorValidators = require("./editor.validators");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");

router.use(authenticate);

router.get("/playground-files", editorController.listPlaygroundFiles);

router.post(
  "/playground-files",
  validate({
    body: editorValidators.createPlaygroundFile,
  }),
  editorController.createPlaygroundFile,
);

router.patch(
  "/playground-files/:fileId",
  validate({
    params: editorValidators.playgroundFileParams,
    body: editorValidators.updatePlaygroundFile,
  }),
  editorController.updatePlaygroundFile,
);

router.patch(
  "/playground-files/:fileId/open",
  validate({
    params: editorValidators.playgroundFileParams,
  }),
  editorController.openPlaygroundFile,
);

router.post(
  "/run",
  validate({
    body: editorValidators.runCode,
  }),
  editorController.runPlaygroundCode,
);

router.post(
  "/:roomId/run",
  validate({
    params: editorValidators.roomParams,
    body: editorValidators.runCode,
  }),
  editorController.runCode,
);

module.exports = router;
