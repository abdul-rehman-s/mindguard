import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { updateMissionSchema } from "@/lib/validators";
import { logError } from "@/lib/logger";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = updateMissionSchema.parse(body);

    const existing = await db.mission.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Mission not found" },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};
    if (validated.title !== undefined) data.title = validated.title;
    if (validated.description !== undefined)
      data.description = validated.description;
    if (validated.priority !== undefined) data.priority = validated.priority;
    if (validated.status === "completed") {
      data.status = "completed";
      data.completedAt = new Date();
    } else if (validated.status === "deleted") {
      data.status = "deleted";
    }

    // Defense-in-depth: include userId in where clause
    const mission = await db.mission.update({
      where: { id, userId },
      data,
      include: { focusSessions: true },
    });

    return NextResponse.json(mission);
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
    logError("missions/[id]", "Failed to update mission", error);
    return NextResponse.json(
      { error: "Failed to update mission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  const { id } = await params;

  try {
    const existing = await db.mission.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Mission not found" },
        { status: 404 }
      );
    }

    // Defense-in-depth: include userId in where clause
    await db.mission.update({
      where: { id, userId },
      data: { status: "deleted" },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    logError("missions/[id]", "Failed to delete mission", e);
    return NextResponse.json(
      { error: "Failed to delete mission" },
      { status: 500 }
    );
  }
}
