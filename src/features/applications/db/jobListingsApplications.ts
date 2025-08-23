import { db } from '@/drizzle/db';
import { JobListingApplicationTable } from '@/drizzle/schema';

export async function insertJobListingApplication(
  application: typeof JobListingApplicationTable.$inferInsert
) {
  await db.insert(JobListingApplicationTable).values(application);
}
