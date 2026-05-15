const nodemailer = require("nodemailer");
const env = require("../../config/env");
const logger = require("../../util/logger");

let transporter = null;

const isConfigured = () => {
  return Boolean(env.mail.host && env.mail.user && env.mail.pass);
};

const getTransporter = () => {
  if (!isConfigured()) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    logger.info("Email notification skipped; SMTP is not configured", { to });
    return { skipped: true };
  }

  await activeTransporter.sendMail({
    from: env.mail.from,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};

module.exports = {
  sendEmail,
};
