import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createReflectionSchema } from "@/lib/validators";
import { format } from "date-fns";

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
    const today = format(new Date(), "yyyy-MM-dd");

    const reflections = await db.dailyReflection.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    });

    const todayReflection = reflections.find((r) => r.date === today);

    return NextResponse.json({ reflections, todayReflection });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reflections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

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
    return NextResponse.json(
      { error: "Failed to save reflection" },
      { status: 500 }
    );
  }
}
