import "server-only";

import crypto from "crypto";
import { prisma } from "@/shared/lib/db/prisma";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { TIMING } from "@/lib/constants";

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

type VerificationEmailResult = {
  success: true;
  devEmailPreview?: {
    to: string;
    subject: string;
    verificationUrl: string;
  };
} | {
  success: false;
};

/**
 * 認証メール送信の共通処理
 */
export async function sendVerificationEmail(
  email: string,
  getTemplate: (verificationUrl: string) => EmailTemplate,
  logContext: string = "Verification"
): Promise<VerificationEmailResult> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TIMING.ONE_DAY_MS);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL;
  const verificationUrl = `${baseUrl}/register/complete?token=${token}`;

  const emailTemplate = getTemplate(verificationUrl);

  const emailSent = await sendEmail({
    to: email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text,
  });

  if (process.env.NODE_ENV === "development") {
    logger.debug({ email, token }, `${logContext} token generated`);
    return {
      success: true,
      devEmailPreview: {
        to: email,
        subject: emailTemplate.subject,
        verificationUrl,
      },
    };
  }

  if (!emailSent) {
    await prisma.verificationToken.delete({
      where: { token },
    });
    return { success: false };
  }

  return { success: true };
}

/**
 * 既存のトークンを削除
 */
export async function deleteExistingVerificationToken(email: string): Promise<void> {
  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: { token: existingToken.token },
    });
  }
}
