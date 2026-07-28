import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { batchActivitiesSchema } from "@/lib/validators";
import { startOfDay, endOfDay } from "date-fns";
import type { ActivityType, ActivityCategory, CreateActivityInput } from "@/types";

const VALID_TYPES: ActivityType[] = [
  "focus", "idle", "distracted", "break", "deep_work",
  "learning", "coding", "writing", "meetings",
  "browsing", "entertainment", "gaming",
  "app_usage", "website_usage",
];
const VALID_CATEGORIES: ActivityCategory[] = [
  "coding", "design", "communication", "entertainment",
  "research", "writing", "meetings", "learning", "other",
];

/** POST — Create single activity or batch of activities */
export async function POST(req: Request) {
  const userIdOr401 = await getAuthUserId(req);
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const raw = await req.json();

    // Detect batch format: { activities: [...] }
    if (raw.activities && Array.isArray(raw.activities)) {
      const validated = batchActivitiesSchema.parse(raw);

      const created = await db.desktopActivity.createMany({
        data: validated.activities.map((a) => ({
          userId,
          type: a.type,
          title: a.title || null,
          category: a.category || null,
          duration: a.duration,
          startedAt: new Date(a.startedAt),
          endedAt: a.endedAt ? new Date(a.endedAt) : null,
          application: a.application || null,
          website: a.website || null,
          metadata: a.metadata || null,
        })),
      });

      logInfo("activities", `Batch created ${created.count} activities for user ${userId}`);
      return NextResponse.json({ created: created.count }, { status: 201 });
    }

    // Single activity format
    const body = raw as CreateActivityInput;

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
  } catch (e: unknown) {
    if (e && typeof e === "object" && "issues" in e) {
      return NextResponse.json(
        { error: "Validation failed", details: (e as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError("activities", "Failed to record activity", e);
    return NextResponse.json({ error: "Failed to record activity" }, { status: 500 });
  }
}

/** GET — List activities with filters */
export async function GET(req: Request) {
  const userIdOr401 = await getAuthUserId(req);
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

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
    logError("activities", "Failed to fetch activities", e);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

/** DELETE — Delete all activities for user */
export async function DELETE(request: Request) {
  const userIdOr401 = await getAuthUserId(request);
  if (userIdOr401 instanceof NextResponse) return userIdOr401;
  const userId = userIdOr401;

  try {
    const count = await db.desktopActivity.deleteMany({ where: { userId } });
    return NextResponse.json({ deleted: count.count });
  } catch (e) {
    logError("activities", "Failed to delete activities", e);
    return NextResponse.json({ error: "Failed to delete activities" }, { status: 500 });
  }
}
