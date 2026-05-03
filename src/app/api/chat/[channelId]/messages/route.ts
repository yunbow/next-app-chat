import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/db/prisma";
import {
  AccessDeniedError,
  listMessages,
  markAsRead,
  resolveChannel,
  sendMessage,
} from "@/features/chat/services/chat-service";
import { auth } from "@/shared/lib/auth/options";

export const dynamic = "force-dynamic";

const sendSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(["text", "image", "file"]).optional(),
  imageUrl: z.string().optional(),
});

async function authedUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}

function errorResponse(error: unknown) {
  if (error instanceof AccessDeniedError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Validation error", details: error.issues },
      { status: 400 }
    );
  }
  console.error("Chat route error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(req: NextRequest, props: { params: Promise<{ channelId: string }> }) {
  const params = await props.params;
  try {
    const user = await authedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const channel = await resolveChannel(params.channelId, user.id);
    const messages = await listMessages(channel, { limit, offset });

    // Auto-mark received messages as read (consistent for both group and DM)
    await markAsRead(channel, user.id, { name: user.name, image: user.image });

    return NextResponse.json({ messages, channel });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ channelId: string }> }) {
  const params = await props.params;
  try {
    const user = await authedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const payload = sendSchema.parse(body);

    const channel = await resolveChannel(params.channelId, user.id);
    const message = await sendMessage(channel, user.id, payload);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
