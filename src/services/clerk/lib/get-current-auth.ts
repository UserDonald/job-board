import { db } from '@/drizzle/db';
import { OrganizationTable, UserTable } from '@/drizzle/schema';
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

export async function getCurrentOrganization() {
  const { orgId } = await auth();

  return {
    orgId,
    organization: orgId ? await getOrganization(orgId) : undefined,
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

async function getOrganization(orgId: string | null) {
  if (!orgId) {
    return null;
  }

  return db.query.OrganizationTable.findFirst({
    where: eq(OrganizationTable.id, orgId),
  });
}
