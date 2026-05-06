import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/shared/lib/auth/options";
import { uploadToR2, R2_ENABLED, buildAttachmentKey } from "@/lib/storage/r2";
export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!R2_ENABLED) {
      return NextResponse.json({ error: 'Storage is not configured' }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
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
