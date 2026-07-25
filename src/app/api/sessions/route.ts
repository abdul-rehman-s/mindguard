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

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const missionId = searchParams.get("missionId") || undefined;

    const where = { userId, ...(missionId ? { missionId } : {}) };

    const [sessions, total] = await Promise.all([
      db.focusSession.findMany({
        where,
        include: {
          mission: { select: { id: true, title: true, priority: true } },
        },
        orderBy: { startedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.focusSession.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ sessions, total, page, limit, totalPages });
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
