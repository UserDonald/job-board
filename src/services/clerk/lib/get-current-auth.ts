import { db } from '@/drizzle/db';
import { UserTable } from '@/drizzle/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function getCurrentUser({
  allData = false,
}: {
  allData?: boolean;
} = {}) {
  const { userId } = await auth();

  return {
    userId,
    user: allData && userId ? await getUser(userId) : undefined,
  };
}

async function getUser(userId: string | null) {
  if (!userId) {
    return null;
  }

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
  });
}
