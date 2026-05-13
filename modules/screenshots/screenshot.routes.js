const router = require("express").Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const screenshotController = require("./screenshot.controller");
const screenshotValidators = require("./screenshot.validators");
const { uploadScreenshot } = require("./screenshot.upload");

router.use(authenticate);

router
  .route("/rooms/:roomId/screenshots")
  .get(
    validate({
      params: screenshotValidators.roomParams,
      query: screenshotValidators.listScreenshots,
    }),
    screenshotController.listScreenshots,
  )
  .post(
    validate({ params: screenshotValidators.roomParams }),
    uploadScreenshot,
    validate({ body: screenshotValidators.uploadScreenshot }),
    screenshotController.uploadScreenshot,
  );

module.exports = router;
