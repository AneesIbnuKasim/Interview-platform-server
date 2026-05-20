const TeamInvitation = require("../../models/TeamInvitation");
const env = require("../../config/env");
const roomRepository = require("../rooms/room.repository");
const { sendEmail } = require("../notifications/email.service");
const { AppError, NotFoundError } = require("../../util/errors");

const appUrl = () => {
  return env.frontendUrl || env.clientOrigins?.[0] || "http://localhost:5173";
};

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const buildInviteEmail = (inviter, payload, room) => {
  const inviteeName = payload.name ? ` ${payload.name}` : "";
  const roomCode = room.code || room.id;
  const link = `${appUrl().replace(/\/$/, "")}/room/${encodeURIComponent(roomCode)}`;
  const subject = `Invitation to join ${room.title} on Pairloop`;
  const safeInviteeName = escapeHtml(inviteeName);
  const safeInviterName = escapeHtml(inviter.name);
  const safeRoomTitle = escapeHtml(room.title);
  const safeRoomCode = escapeHtml(roomCode);
  const safeLink = escapeHtml(link);
  const text = [
    `Hi${inviteeName},`,
    "",
    `${inviter.name} invited you to join ${room.title} on Pairloop.`,
    `Room code: ${roomCode}`,
    `Room link: ${link}`,
    "",
    "The room creator will admit you before you enter.",
    "",
    "This invite does not grant access by itself.",
  ].join("\n");
  const html = [
    `<p>Hi${safeInviteeName},</p>`,
    `<p>${safeInviterName} invited you to join <strong>${safeRoomTitle}</strong> on Pairloop.</p>`,
    `<p>Room code: <strong>${safeRoomCode}</strong></p>`,
    `<p><a href="${safeLink}">Open interview room</a></p>`,
    "<p>The room creator will admit you before you enter. This invite does not grant access by itself.</p>",
  ].join("");

  return {
    subject,
    text,
    html,
  };
};

const getOwnedRoom = async (roomId, user) => {
  const room = await roomRepository.findByIdOrCode(roomId);

  if (!room) {
    throw new NotFoundError("Room not found");
  }

  if (room.owner.toString() !== user._id.toString()) {
    throw new AppError(
      "Only the room owner can invite teammates",
      403,
      "ROOM_OWNER_REQUIRED",
    );
  }

  return room;
};

const createInviteDocument = async (user, payload, room, result = {}) => {
  const invitation = await TeamInvitation.create({
    inviter: user._id,
    inviteeEmail: payload.email,
    inviteeName: payload.name || "",
    room: room._id,
    roomCode: room.code,
    roomTitle: room.title,
    status: result.status || "sent",
    emailSkipped: Boolean(result.emailSkipped),
    lastError: result.lastError || "",
    sentAt: new Date(),
  });

  return invitation;
};

const sendInvitationEmail = async (user, payload, room) => {
  const email = buildInviteEmail(user, payload, room);
  return sendEmail({
    to: payload.email,
    ...email,
  });
};

const sendInvitation = async (payload, user) => {
  const room = await getOwnedRoom(payload.roomId, user);

  try {
    const result = await sendInvitationEmail(user, payload, room);
    const invitation = await createInviteDocument(user, payload, room, {
      status: "sent",
      emailSkipped: Boolean(result?.skipped),
    });

    return { invitation: invitation.toClient() };
  } catch (error) {
    const invitation = await createInviteDocument(user, payload, room, {
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

  if (!invitation.roomCode || !invitation.roomTitle) {
    throw new AppError(
      "This invite is missing room context and cannot be resent",
      409,
      "TEAM_INVITE_ROOM_REQUIRED",
    );
  }

  const payload = {
    email: invitation.inviteeEmail,
    name: invitation.inviteeName,
  };
  const room = {
    _id: invitation.room,
    code: invitation.roomCode,
    id: invitation.roomCode,
    title: invitation.roomTitle,
  };

  try {
    const result = await sendInvitationEmail(user, payload, room);
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
