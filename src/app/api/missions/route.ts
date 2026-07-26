import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { createMissionSchema } from "@/lib/validators";
import { logError } from "@/lib/logger";

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const missions = await db.mission.findMany({
      where: { userId, status: { in: ["active", "completed"] } },
      include: { focusSessions: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(missions);
  } catch (e) {
    logError("missions", "Failed to fetch missions", e);
    return NextResponse.json(
      { error: "Failed to fetch missions" },
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
    const validated = createMissionSchema.parse(body);

    const activeMission = await db.mission.findFirst({
      where: { userId, status: "active" },
    });

    if (activeMission) {
      return NextResponse.json(
        { error: "You already have an active mission. Complete or archive it first." },
        { status: 409 }
      );
    }

    const mission = await db.mission.create({
      data: {
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        userId,
      },
      include: { focusSessions: true },
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError("missions", "Failed to create mission", error);
    return NextResponse.json(
      { error: "Failed to create mission" },
      { status: 500 }
    );
  }
}
