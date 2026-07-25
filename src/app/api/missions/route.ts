import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createMissionSchema } from "@/lib/validators";

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
    const missions = await db.mission.findMany({
      where: { userId, status: { in: ["active", "completed"] } },
      include: { focusSessions: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(missions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch missions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

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
    return NextResponse.json(
      { error: "Failed to create mission" },
      { status: 500 }
    );
  }
}