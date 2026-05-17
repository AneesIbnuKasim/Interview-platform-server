const TeamInvitation = require("../../models/TeamInvitation");
const env = require("../../config/env");
const { sendEmail } = require("../notifications/email.service");
const { AppError, NotFoundError } = require("../../util/errors");

const appUrl = () => {
  return env.frontendUrl || env.clientOrigins?.[0] || "http://localhost:5173";
};

const buildInviteEmail = (inviter, payload) => {
  const inviteeName = payload.name ? ` ${payload.name}` : "";
  const link = `${appUrl().replace(/\/$/, "")}/dashboard`;
  const subject = `${inviter.name} invited you to Pairloop`;
  const text = [
    `Hi${inviteeName},`,
    "",
    `${inviter.name} invited you to collaborate on Pairloop.`,
    "When you join an interview room, the room creator will admit you before you enter.",
    "",
    `Open Pairloop: ${link}`,
  ].join("\n");
  const html = [
    `<p>Hi${inviteeName},</p>`,
    `<p>${inviter.name} invited you to collaborate on Pairloop.</p>`,
    "<p>When you join an interview room, the room creator will admit you before you enter.</p>",
    `<p><a href="${link}">Open Pairloop</a></p>`,
  ].join("");

  return {
    subject,
    text,
    html,
  };
};

const createInviteDocument = async (user, payload, result = {}) => {
  const invitation = await TeamInvitation.create({
    inviter: user._id,
    inviteeEmail: payload.email,
    inviteeName: payload.name || "",
    status: result.status || "sent",
    emailSkipped: Boolean(result.emailSkipped),
    lastError: result.lastError || "",
    sentAt: new Date(),
  });

  return invitation;
};

const sendInvitationEmail = async (user, payload) => {
  const email = buildInviteEmail(user, payload);
  return sendEmail({
    to: payload.email,
    ...email,
  });
};

const sendInvitation = async (payload, user) => {
  try {
    const result = await sendInvitationEmail(user, payload);
    const invitation = await createInviteDocument(user, payload, {
      status: "sent",
      emailSkipped: Boolean(result?.skipped),
    });

    return { invitation: invitation.toClient() };
  } catch (error) {
    const invitation = await createInviteDocument(user, payload, {
      status: "failed",
      lastError: error.message || "Email delivery failed",
    });

    throw new AppError(
      "Unable to send teammate invite",
      502,
      "TEAM_INVITE_EMAIL_FAILED",
      { invitation: invitation.toClient() },
    );
  }
};

const listInvitations = async (user, options = {}) => {
  const limit = options.limit || 20;
  const invitations = await TeamInvitation.find({ inviter: user._id })
    .sort({ sentAt: -1 })
    .limit(limit);

  return {
    invitations: invitations.map((invitation) => invitation.toClient()),
  };
};

const resendInvitation = async (invitationId, user) => {
  const invitation = await TeamInvitation.findOne({
    _id: invitationId,
    inviter: user._id,
  });

  if (!invitation) {
    throw new NotFoundError("Team invitation not found");
  }

  const payload = {
    email: invitation.inviteeEmail,
    name: invitation.inviteeName,
  };

  try {
    const result = await sendInvitationEmail(user, payload);
    invitation.status = "sent";
    invitation.emailSkipped = Boolean(result?.skipped);
    invitation.lastError = "";
    invitation.sentAt = new Date();
    await invitation.save();

    return { invitation: invitation.toClient() };
  } catch (error) {
    invitation.status = "failed";
    invitation.emailSkipped = false;
    invitation.lastError = error.message || "Email delivery failed";
    invitation.sentAt = new Date();
    await invitation.save();

    throw new AppError(
      "Unable to resend teammate invite",
      502,
      "TEAM_INVITE_EMAIL_FAILED",
      { invitation: invitation.toClient() },
    );
  }
};

module.exports = {
  listInvitations,
  resendInvitation,
  sendInvitation,
};
