import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const res = await db.select().from(users).where(eq(users.uid, uid));
    return res[0] || null;
  } catch (error) {
    console.error('Database getUserProfile failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateUserProfile(uid: string, data: Partial<typeof users.$inferInsert>) {
  try {
    const res = await db
      .update(users)
      .set(data)
      .where(eq(users.uid, uid))
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database updateUserProfile failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
