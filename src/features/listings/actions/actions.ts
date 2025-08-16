'use server';

import { db } from '@/drizzle/db';
import { JobListingTable } from '@/drizzle/schema';
import { getCurrentOrganization } from '@/services/clerk/lib/get-current-auth';
import { hasOrgUserPermission } from '@/services/clerk/lib/org-user-permissions';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import z from 'zod';
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
} from '../db/jobListings';
import { jobListingSchema } from './schemas';

export async function createJobListing(data: z.infer<typeof jobListingSchema>) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission('job_listings:create'))) {
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  }

  const { success, data: validatedData } = jobListingSchema.safeParse(data);
  if (!success) {
    return {
      error: true,
      message: 'There was an error creating your job listing',
    };
  }

  const jobListing = await insertJobListing({
    ...validatedData,
    organizationId: orgId,
    status: 'draft',
  });

  redirect(`/employer/job-listings/${jobListing.id}`);
}

export async function updateJobListing(
  id: string,
  data: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission('job_listings:update'))) {
    return {
      error: true,
      message: "You don't have permission to update a job listing",
    };
  }

  const { success, data: validatedData } = jobListingSchema.safeParse(data);
  if (!success) {
    return {
      error: true,
      message: 'There was an error updating your job listing',
    };
  }

  const jobListing = await getJobListing(id, orgId);

  if (!jobListing) {
    return {
      error: true,
      message: 'There was an error updating your job listing',
    };
  }

  const updatedJobListing = await updateJobListingDb(id, validatedData);

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
}

async function getJobListing(id: string, orgId: string) {
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    ),
  });
}
