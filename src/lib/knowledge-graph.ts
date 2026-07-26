import { db } from '@/lib/db';
import { subDays } from 'date-fns';
import { logError } from '@/lib/logger';
import type { KnowledgeGraph, KnowledgeGraphNode, KnowledgeGraphEdge } from '@/types';

/**
 * Knowledge Graph Service — builds relationship maps between user entities.
 * This is a SERVICE (not a Prisma model). It reads existing data and constructs
 * relationship maps on the fly.
 */

export async function buildKnowledgeGraph(userId: string): Promise<KnowledgeGraph> {
  try {
    const nodes: KnowledgeGraphNode[] = [];
    const edges: KnowledgeGraphEdge[] = [];

    // Fetch all relevant data
    const [sessions, missions, reflections, activities, achievements] = await Promise.all([
      db.focusSession.findMany({
        where: { userId, startedAt: { gte: subDays(new Date(), 30) }, type: { not: 'break' } },
        select: { id: true, missionId: true, duration: true, startedAt: true, quality: true },
      }),
      db.mission.findMany({
        where: { userId, status: 'active' },
        select: { id: true, title: true, status: true, createdAt: true },
      }),
      db.dailyReflection.findMany({
        where: { userId, createdAt: { gte: subDays(new Date(), 30) } },
        select: { id: true, date: true, mood: true, energy: true, distraction: true },
      }),
      db.desktopActivity.findMany({
        where: { userId, startedAt: { gte: subDays(new Date(), 30) } },
        select: { id: true, type: true, title: true, category: true, duration: true, startedAt: true },
      }),
      db.achievement.findMany({
        where: { userId },
        select: { id: true, type: true, unlockedAt: true },
      }),
    ]);

    // ─── Build Nodes ───

    // Mission nodes
    for (const m of missions) {
      nodes.push({
        id: `mission:${m.id}`,
        type: 'mission',
        label: m.title,
        data: { status: m.status, createdAt: m.createdAt.toISOString() },
      });
    }

    // Session nodes (limit to recent 20)
    for (const s of sessions.slice(0, 20)) {
      nodes.push({
        id: `session:${s.id}`,
        type: 'session',
        label: `${Math.round(s.duration / 60)}min focus session`,
        data: { duration: s.duration, startedAt: s.startedAt.toISOString(), quality: s.quality },
      });
    }

    // Reflection nodes (limit to recent 7)
    for (const r of reflections.slice(0, 7)) {
      nodes.push({
        id: `reflection:${r.id}`,
        type: 'reflection',
        label: `Reflection for ${r.date}`,
        data: { mood: r.mood, energy: r.energy, distraction: r.distraction },
      });
    }

    // Activity nodes (limit to top 10 by duration)
    const topActivities = activities
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
    for (const a of topActivities) {
      nodes.push({
        id: `activity:${a.id}`,
        type: 'activity',
        label: a.title || a.type,
        data: { type: a.type, category: a.category, duration: a.duration },
      });
    }

    // Achievement nodes
    for (const ach of achievements.slice(0, 5)) {
      nodes.push({
        id: `achievement:${ach.id}`,
        type: 'achievement',
        label: ach.type,
        data: { unlockedAt: ach.unlockedAt.toISOString() },
      });
    }

    // User node (always present)
    nodes.push({
      id: `user:${userId}`,
      type: 'user',
      label: 'You',
      data: {},
    });

    // ─── Build Edges ───

    // FocusSession → Mission
    for (const s of sessions.slice(0, 20)) {
      if (s.missionId) {
        edges.push({
          source: `session:${s.id}`,
          target: `mission:${s.missionId}`,
          relation: 'was_for',
          weight: s.duration / 3600, // weight by hours
        });
      }
      // Session → User
      edges.push({
        source: `session:${s.id}`,
        target: `user:${userId}`,
        relation: 'belongs_to',
        weight: 0.5,
      });
    }

    // Mission → Reflection (completed mission, then reflected)
    const completedMissions = await db.mission.findMany({
      where: { userId, status: 'completed' },
      select: { id: true, title: true, completedAt: true },
    });

    for (const m of completedMissions.slice(0, 5)) {
      // Find reflection closest to completion date
      if (m.completedAt) {
        const dayAfterCompletion = new Date(m.completedAt);
        dayAfterCompletion.setDate(dayAfterCompletion.getDate() + 1);
        const dateStr = dayAfterCompletion.toISOString().split('T')[0];

        const matchingReflection = reflections.find(r => r.date === dateStr);
        if (matchingReflection) {
          edges.push({
            source: `mission:${m.id}`,
            target: `reflection:${matchingReflection.id}`,
            relation: 'reflected_after',
            weight: 0.8,
          });
        }
      }
    }

    // Reflection → Mood
    for (const r of reflections.slice(0, 7)) {
      if (r.mood) {
        nodes.push({
          id: `mood:${r.id}`,
          type: 'mood',
          label: `Mood: ${r.mood}/10`,
          data: { value: r.mood },
        });
        edges.push({
          source: `reflection:${r.id}`,
          target: `mood:${r.id}`,
          relation: 'had_mood',
          weight: r.mood / 10,
        });
      }
    }

    // Mood → Productivity (sessions on that day)
    for (const r of reflections.slice(0, 7)) {
      if (r.mood) {
        const daySessions = sessions.filter(s =>
          new Date(s.startedAt).toISOString().split('T')[0] === r.date
        );
        const totalMinutes = Math.round(daySessions.reduce((a, s) => a + s.duration / 60, 0));

        if (totalMinutes > 0) {
          nodes.push({
            id: `productivity:${r.date}`,
            type: 'productivity',
            label: `${totalMinutes}min productive`,
            data: { minutes: totalMinutes },
          });
          edges.push({
            source: `mood:${r.id}`,
            target: `productivity:${r.date}`,
            relation: 'correlated_with',
            weight: Math.min(1, totalMinutes / 240),
          });
        }
      }
    }

    // Activity → Distraction
    const distractedActivities = activities.filter(a =>
      ['distracted', 'entertainment', 'gaming', 'browsing'].includes(a.type)
    );
    for (const a of distractedActivities.slice(0, 5)) {
      nodes.push({
        id: `distraction:${a.id}`,
        type: 'distraction',
        label: a.title || a.type,
        data: { duration: a.duration, source: a.title || a.type },
      });
      edges.push({
        source: `activity:${a.id}`,
        target: `distraction:${a.id}`,
        relation: 'caused_distraction',
        weight: a.duration / 3600,
      });
    }

    // Achievement → User
    for (const ach of achievements.slice(0, 5)) {
      edges.push({
        source: `achievement:${ach.id}`,
        target: `user:${userId}`,
        relation: 'earned_by',
        weight: 0.7,
      });
    }

    return { nodes, edges };
  } catch (error) {
    logError('knowledge-graph', 'buildKnowledgeGraph failed', error);
    return { nodes: [], edges: [] };
  }
}

export async function getRelationships(
  userId: string,
  entityType: string,
  entityId: string
): Promise<KnowledgeGraphEdge[]> {
  const graph = await buildKnowledgeGraph(userId);
  const nodeId = `${entityType}:${entityId}`;

  return graph.edges.filter(
    e => e.source === nodeId || e.target === nodeId
  );
}

export async function explainConnection(
  userId: string,
  sourceType: string,
  sourceId: string,
  targetType: string,
  targetId: string
): Promise<string> {
  const graph = await buildKnowledgeGraph(userId);
  const sourceNodeId = `${sourceType}:${sourceId}`;
  const targetNodeId = `${targetType}:${targetId}`;

  const edge = graph.edges.find(
    e =>
      (e.source === sourceNodeId && e.target === targetNodeId) ||
      (e.source === targetNodeId && e.target === sourceNodeId)
  );

  if (!edge) {
    return `No direct connection found between ${sourceType}:${sourceId} and ${targetType}:${targetId}`;
  }

  const sourceNode = graph.nodes.find(n => n.id === edge.source);
  const targetNode = graph.nodes.find(n => n.id === edge.target);

  return `${sourceNode?.label || edge.source} → ${edge.relation} → ${targetNode?.label || edge.target} (weight: ${edge.weight.toFixed(2)})`;
}
