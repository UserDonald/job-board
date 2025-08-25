import { db } from '@/drizzle/db';
import { OrganizationTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function insertOrganization(
  organization: typeof OrganizationTable.$inferInsert
) {
  await db.insert(OrganizationTable).values(organization).onConflictDoNothing();
}

export async function updateOrganization(
  organizationId: string,
  organization: Partial<typeof OrganizationTable.$inferSelect>
) {
  await db
    .update(OrganizationTable)
    .set(organization)
    .where(eq(OrganizationTable.id, organizationId));
}

export async function deleteOrganization(organizationId: string) {
  await db
    .delete(OrganizationTable)
    .where(eq(OrganizationTable.id, organizationId));
}
