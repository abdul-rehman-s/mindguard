import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateMissionSchema } from "@/lib/validators";

async function getUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

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

    const mission = await db.mission.update({
      where: { id },
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
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

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

    await db.mission.update({
      where: { id },
      data: { status: "deleted" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete mission" },
      { status: 500 }
    );
  }
}