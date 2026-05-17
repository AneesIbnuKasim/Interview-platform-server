const asyncHandler = require("../../util/asyncHandler");
const apiResponse = require("../../util/apiResponse");
const teamService = require("./team.service");

const sendInvitation = asyncHandler(async (req, res) => {
  const data = await teamService.sendInvitation(req.body, req.user);
  apiResponse.created(res, data, "Teammate invite sent");
});

const listInvitations = asyncHandler(async (req, res) => {
  const data = await teamService.listInvitations(req.user, req.query);
  apiResponse.success(res, data, "Team invitations fetched successfully");
});

const resendInvitation = asyncHandler(async (req, res) => {
  const data = await teamService.resendInvitation(
    req.params.invitationId,
    req.user,
  );
  apiResponse.success(res, data, "Teammate invite resent");
});

module.exports = {
  listInvitations,
  resendInvitation,
  sendInvitation,
};
