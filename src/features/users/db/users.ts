import { db } from '@/drizzle/db';
import { UserTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function insertUser(user: typeof UserTable.$inferInsert) {
  await db.insert(UserTable).values(user).onConflictDoNothing();
}

export async function updateUser(
  userId: string,
  user: Partial<typeof UserTable.$inferSelect>
) {
  await db.update(UserTable).set(user).where(eq(UserTable.id, userId));
}

export async function deleteUser(userId: string) {
  await db.delete(UserTable).where(eq(UserTable.id, userId));
}
