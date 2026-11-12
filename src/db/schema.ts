import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table linked with Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  weightKg: integer('weight_kg').default(70),
  heightCm: integer('height_cm').default(175),
  dailyStepGoal: integer('daily_step_goal').default(10000),
  weeklyDistanceGoalKm: integer('weekly_distance_goal_km').default(25),
  unit: text('unit').default('metric'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Activities table storing tracked routes and fitness telemetry
export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // References Firebase Auth UID
  title: text('title').notNull(),
  type: text('type').notNull(), // 'walk' | 'run' | 'ride' | 'hike' | 'travel'
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  distanceMeters: integer('distance_meters').notNull(),
  movingTimeSeconds: integer('moving_time_seconds').notNull(),
  totalTimeSeconds: integer('total_time_seconds').notNull(),
  elevationGainMeters: integer('elevation_gain_meters').default(0),
  calories: integer('calories').default(0),
  steps: integer('steps').default(0),
  avgSpeedKmh: text('avg_speed_kmh'),
  maxSpeedKmh: text('max_speed_kmh'),
  avgPaceSecondsPerKm: integer('avg_pace_seconds_per_km'),
  bestPaceSecondsPerKm: integer('best_pace_seconds_per_km'),
  pointsJson: text('points_json'), // Serialized LocationPoint array
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.uid],
  }),
}));
