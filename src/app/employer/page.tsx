import { db } from '@/drizzle/db';
import { JobListingTable } from '@/drizzle/schema';
import { getCurrentOrganization } from '@/services/clerk/lib/get-current-auth';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default function EmployerHomePage() {
  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  );
}

async function SuspendedPage() {
  const { orgId } = await getCurrentOrganization();

  if (orgId == null) return null;

  const jobListing = await getMostRecentJobListing(orgId);

  if (jobListing == null) redirect('/employer/job-listings/new');
  else redirect(`/employer/job-listings/${jobListing.id}`);
}

async function getMostRecentJobListing(orgId: string) {
  const jobListings = await db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.organizationId, orgId),
    orderBy: [desc(JobListingTable.createdAt)],
    columns: {
      id: true,
    },
  });

  return jobListings;
}
