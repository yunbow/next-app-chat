import "server-only";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { logger } from "@/lib/logger";

/**
 * メール送信オプション
 */
export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let transporter: Transporter | null = null;

/**
 * SMTPトランスポーターを取得または作成
 */
function getTransporter(): Transporter | null {
  if (
    process.env.NODE_ENV === "development" ||
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    return null;
  }

  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  logger.info({ host: process.env.SMTP_HOST, port: process.env.SMTP_PORT }, "SMTP transporter initialized");

  return transporter;
}

/**
 * メールを送信
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const mailer = getTransporter();

  if (!mailer) {
    logger.debug({ to: options.to, subject: options.subject }, "Email sending skipped (development mode or SMTP not configured)");
    return true;
  }

  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    const fromName = process.env.SMTP_FROM_NAME || "Chat";

    await mailer.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    logger.info({ to: options.to, subject: options.subject }, "Email sent successfully");
    return true;
  } catch (error) {
    logger.error({
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : String(error),
    }, "Failed to send email");
    return false;
  }
}
