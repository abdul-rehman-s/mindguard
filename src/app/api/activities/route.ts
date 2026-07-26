import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";
import type { ActivityType, ActivityCategory, CreateActivityInput } from "@/types";

const VALID_TYPES: ActivityType[] = ["focus", "idle", "distracted", "break", "deep_work", "app_usage", "website_usage"];
const VALID_CATEGORIES: ActivityCategory[] = ["coding", "design", "communication", "entertainment", "research", "other"];

async function getUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = session.user as Record<string, unknown>;
  return user.id as string;
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const body = (await req.json()) as CreateActivityInput;

    if (!body.type || !VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
    }
    if (!body.duration || body.duration < 0) {
      return NextResponse.json({ error: "Duration must be positive" }, { status: 400 });
    }
    if (!body.startedAt) {
      return NextResponse.json({ error: "startedAt is required" }, { status: 400 });
    }
    if (body.category && !VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const activity = await db.desktopActivity.create({
      data: {
        userId,
        type: body.type,
        title: body.title || null,
        category: body.category || null,
        duration: body.duration,
        startedAt: new Date(body.startedAt),
        endedAt: body.endedAt ? new Date(body.endedAt) : null,
        application: body.application || null,
        website: body.website || null,
        metadata: body.metadata || null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (e) {
    console.error("[activities] POST error", e);
    return NextResponse.json({ error: "Failed to record activity" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const type = url.searchParams.get("type");
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = { userId };

    if (from || to) {
      where.startedAt = {};
      if (from) (where.startedAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.startedAt as Record<string, unknown>).lte = new Date(to);
    } else {
      where.startedAt = {
        gte: startOfDay(new Date()),
        lte: endOfDay(new Date()),
      };
    }

    if (type && VALID_TYPES.includes(type as ActivityType)) {
      where.type = type;
    }

    const activities = await db.desktopActivity.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: Math.min(limit, 200),
    });

    return NextResponse.json({ activities });
  } catch (e) {
    console.error("[activities] GET error", e);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function DELETE() {
  const userId = await getUserId();
  if (userId instanceof NextResponse) return userId;

  try {
    const count = await db.desktopActivity.deleteMany({ where: { userId } });
    return NextResponse.json({ deleted: count.count });
  } catch (e) {
    console.error("[activities] DELETE error", e);
    return NextResponse.json({ error: "Failed to delete activities" }, { status: 500 });
  }
}
