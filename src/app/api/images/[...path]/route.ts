import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { auth } from "@/shared/lib/auth/options";
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  try {
    // 認証チェック（必要に応じて）
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // パスを結合
    const imagePath = params.path.join("/");
    
    // セキュリティ: パストラバーサル攻撃を防ぐ
    if (imagePath.includes("..") || imagePath.includes("~")) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    // 画像ファイルのパスを構築
    const filePath = join(process.cwd(), "public", "uploads", imagePath);

    // ファイルを読み込む
    const fileBuffer = await readFile(filePath);

    // Content-Typeを設定
    const ext = imagePath.split(".").pop()?.toLowerCase();
    const contentType = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    }[ext || ""] || "application/octet-stream";

    // 画像を返す
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Image not found", { status: 404 });
  }
}
