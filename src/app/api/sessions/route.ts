import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSessionSchema } from "@/lib/validators";

async function getUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

export async function GET() {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const sessions = await db.focusSession.findMany({
      where: { userId },
      include: { mission: { select: { id: true, title: true } } },
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await request.json();
    const validated = createSessionSchema.parse(body);

    const session = await db.focusSession.create({
      data: {
        userId,
        missionId: validated.missionId,
        duration: validated.duration,
        startedAt: new Date(validated.startedAt),
        endedAt: new Date(validated.endedAt),
      },
      include: { mission: { select: { id: true, title: true } } },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: (error as { issues: Array<{ message: string }> }).issues,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}