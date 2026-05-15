const router = require("express").Router();
const editorController = require("./editor.controller");
const editorValidators = require("./editor.validators");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");

router.use(authenticate);

router.post(
  "/:roomId/run",
  validate({
    params: editorValidators.roomParams,
    body: editorValidators.runCode,
  }),
  editorController.runCode,
);

module.exports = router;
