const router = require("express").Router();
const teamController = require("./team.controller");
const teamValidators = require("./team.validators");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");

router.use(authenticate);

router
  .route("/invitations")
  .get(
    validate({ query: teamValidators.listInvitations }),
    teamController.listInvitations,
  )
  .post(
    validate({ body: teamValidators.createInvitation }),
    teamController.sendInvitation,
  );

router.post(
  "/invitations/:invitationId/resend",
  validate({ params: teamValidators.invitationParams }),
  teamController.resendInvitation,
);

module.exports = router;
