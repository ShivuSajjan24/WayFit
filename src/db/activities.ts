import { db } from './index.ts';
import { activities } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { Activity } from '../types/index.ts';

export async function getUserActivities(userId: string): Promise<Activity[]> {
  try {
    const rows = await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.startTime));

    return rows.map((r) => {
      let points = [];
      try {
        points = r.pointsJson ? JSON.parse(r.pointsJson) : [];
      } catch {
        points = [];
      }

      return {
        id: r.id,
        title: r.title,
        type: r.type as any,
        startTime: new Date(r.startTime).getTime(),
        endTime: new Date(r.endTime).getTime(),
        distanceMeters: r.distanceMeters,
        movingTimeSeconds: r.movingTimeSeconds,
        totalTimeSeconds: r.totalTimeSeconds,
        elevationGainMeters: r.elevationGainMeters || 0,
        calories: r.calories || 0,
        steps: r.steps || 0,
        avgSpeedKmh: Number(r.avgSpeedKmh) || 0,
        maxSpeedKmh: Number(r.maxSpeedKmh) || 0,
        avgPaceSecondsPerKm: r.avgPaceSecondsPerKm || 0,
        bestPaceSecondsPerKm: r.bestPaceSecondsPerKm || 0,
        points,
        notes: r.notes || undefined,
      };
    });
  } catch (error) {
    console.error('Database getUserActivities failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function saveUserActivity(act: Activity, userId: string): Promise<Activity> {
  try {
    const pointsStr = JSON.stringify(act.points || []);

    await db
      .insert(activities)
      .values({
        id: act.id,
        userId,
        title: act.title,
        type: act.type,
        startTime: new Date(act.startTime),
        endTime: new Date(act.endTime),
        distanceMeters: act.distanceMeters,
        movingTimeSeconds: act.movingTimeSeconds,
        totalTimeSeconds: act.totalTimeSeconds,
        elevationGainMeters: act.elevationGainMeters,
        calories: act.calories,
        steps: act.steps,
        avgSpeedKmh: String(act.avgSpeedKmh),
        maxSpeedKmh: String(act.maxSpeedKmh),
        avgPaceSecondsPerKm: act.avgPaceSecondsPerKm,
        bestPaceSecondsPerKm: act.bestPaceSecondsPerKm,
        pointsJson: pointsStr,
        notes: act.notes || null,
      })
      .onConflictDoUpdate({
        target: activities.id,
        set: {
          title: act.title,
          notes: act.notes || null,
        },
      });

    return act;
  } catch (error) {
    console.error('Database saveUserActivity failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteUserActivity(id: string, userId: string): Promise<boolean> {
  try {
    const res = await db
      .delete(activities)
      .where(and(eq(activities.id, id), eq(activities.userId, userId)))
      .returning();
    return res.length > 0;
  } catch (error) {
    console.error('Database deleteUserActivity failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
