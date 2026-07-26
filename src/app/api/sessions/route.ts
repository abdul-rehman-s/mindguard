import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { createSessionSchema } from "@/lib/validators";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

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
  } catch (e) {
    logError("sessions", "Failed to fetch sessions", e);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const body = await request.json();
    const validated = createSessionSchema.parse(body);

    // Security: validate that missionId belongs to the user before creating a session
    if (validated.missionId) {
      const mission = await db.mission.findFirst({
        where: { id: validated.missionId, userId },
        select: { id: true },
      });
      if (!mission) {
        return NextResponse.json(
          { error: "Mission not found or does not belong to you" },
          { status: 403 }
        );
      }
    }

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
    logError("sessions", "Failed to create session", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
