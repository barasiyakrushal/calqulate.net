import "server-only";
import nodemailer from "nodemailer";

/**
 * SMTP transport for outbound app email (weekly digest, dose reminders, contact).
 *
 * Sender: meet.akabari@calqulate.net. There is no support@calqulate.net mailbox,
 * so this reuses the same working credentials as the feedback welcome mailer.
 *
 * Config resolution (first that is set wins), so a dedicated mailbox or AWS SES
 * can be dropped in later without touching code:
 *   1. SUPPORT_SMTP_HOST / _PORT / _USER / _PASS   (a dedicated mailbox / SES)
 *   2. FEEDBACK_SMTP_HOST / _PORT / _USER / _PASS  (the meet.akabari mailbox)
 *
 * The From address must match the authenticated user for Gmail/Workspace to send
 * it, so it defaults to the mailbox user (meet.akabari@calqulate.net).
 */
const HOST = process.env.SUPPORT_SMTP_HOST || process.env.FEEDBACK_SMTP_HOST || "smtp.gmail.com";
const PORT = Number(process.env.SUPPORT_SMTP_PORT || process.env.FEEDBACK_SMTP_PORT || 465);
const USER = process.env.SUPPORT_SMTP_USER || process.env.FEEDBACK_SMTP_USER || "meet.akabari@calqulate.net";
const PASS = process.env.SUPPORT_SMTP_PASS || process.env.FEEDBACK_SMTP_PASS;
const FROM = process.env.SUPPORT_FROM_EMAIL || process.env.FEEDBACK_FROM_EMAIL || USER;

export function emailConfigured(): boolean {
  return !!(HOST && USER && PASS);
}

function transport() {
  return nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465, // 465 = implicit TLS; 587 = STARTTLS
    auth: { user: USER, pass: PASS },
  });
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  if (!emailConfigured()) throw new Error("SMTP not configured (set FEEDBACK_SMTP_* or SUPPORT_SMTP_* env vars).");
  return transport().sendMail({
    from: `Calqulate Vitals <${FROM}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: FROM,
  });
}
