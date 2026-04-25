import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import * as crypto from 'crypto';

const signupSchema = z.object({
  username: z.string()
    .min(3, "ユーザー名は3文字以上です")
    .max(30, "ユーザー名は30文字以内です")
    .regex(/^[a-zA-Z0-9_-]+$/, "ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます"),
  email: z.email(),
  password: z.string()
    .min(8, "パスワードは8文字以上です")
    .regex(/[a-zA-Z]/, "パスワードには英字を含める必要があります")
    .regex(/[0-9]/, "パスワードには数字を含める必要があります"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

// ユニークなuserIdを生成する関数
function generateUserId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);

    // 既存ユーザーをチェック（メールアドレス）
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }

    // 既存ユーザーをチェック（ユーザー名）
    const existingUsername = await prisma.user.findFirst({
      where: { name: validatedData.username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'このユーザー名は既に使用されています' },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // ユニークなuserIdを生成（重複チェック付き）
    let userId = generateUserId();
    let userIdExists = await prisma.user.findUnique({ where: { userId } });
    while (userIdExists) {
      userId = generateUserId();
      userIdExists = await prisma.user.findUnique({ where: { userId } });
    }

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.username,
        userId,
        password: hashedPassword,
      },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        image: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
