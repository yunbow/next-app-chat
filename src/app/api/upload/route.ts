import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/shared/lib/auth/options";
import { uploadToR2, R2_ENABLED, buildAttachmentKey } from "@/lib/storage/r2";
import { getUserPlan } from "@/shared/lib/stripe/get-user-plan";
import { getLimits } from "@/shared/lib/stripe/plan-limits";
import { prisma } from "@/shared/lib/db/prisma";
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!R2_ENABLED) {
      return NextResponse.json({ error: 'Storage is not configured' }, { status: 503 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = await getUserPlan(user.id);
    const limits = getLimits(plan);

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (limits.allowedMimeTypes !== null && !limits.allowedMimeTypes.includes(file.type)) {
      const typesLabel = plan === 'free' ? '画像 (JPEG/PNG/GIF/WebP)' : '画像・PDF';
      return NextResponse.json(
        { error: `このファイル形式はご利用のプランでは使用できません。対応形式: ${typesLabel}`, code: 'FILE_TYPE_NOT_ALLOWED', plan },
        { status: 403 }
      );
    }

    if (file.size > limits.maxFileSizeBytes) {
      const limitMB = limits.maxFileSizeBytes / 1024 / 1024;
      return NextResponse.json(
        { error: `ファイルサイズが上限 (${limitMB}MB) を超えています`, code: 'FILE_SIZE_EXCEEDED', limitBytes: limits.maxFileSizeBytes, plan },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = buildAttachmentKey(file.type, buffer);
    const url = await uploadToR2({ key, body: buffer, contentType: file.type });

    return NextResponse.json({ url, filename: key.split('/').pop(), size: file.size, type: file.type });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
