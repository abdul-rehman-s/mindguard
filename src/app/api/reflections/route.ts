import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { createReflectionSchema } from "@/lib/validators";
import { logError } from "@/lib/logger";
import { format } from "date-fns";

export async function GET() {
  const userIdOr401 = await getAuthUserId();
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const today = format(new Date(), "yyyy-MM-dd");

    const reflections = await db.dailyReflection.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    });

    const todayReflection = reflections.find((r) => r.date === today);

    return NextResponse.json({ reflections, todayReflection });
  } catch (e) {
    logError("reflections", "Failed to fetch reflections", e);
    return NextResponse.json(
      { error: "Failed to fetch reflections" },
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
    const validated = createReflectionSchema.parse(body);
    const today = format(new Date(), "yyyy-MM-dd");

    const existing = await db.dailyReflection.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    let reflection;
    if (existing) {
      reflection = await db.dailyReflection.update({
        where: { id: existing.id },
        data: {
          distraction: validated.distraction,
          wentWell: validated.wentWell,
          tomorrowMission: validated.tomorrowMission,
        },
      });
    } else {
      reflection = await db.dailyReflection.create({
        data: {
          userId,
          date: today,
          distraction: validated.distraction,
          wentWell: validated.wentWell,
          tomorrowMission: validated.tomorrowMission,
        },
      });
    }

    return NextResponse.json(reflection, { status: 201 });
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
    logError("reflections", "Failed to save reflection", error);
    return NextResponse.json(
      { error: "Failed to save reflection" },
      { status: 500 }
    );
  }
}
