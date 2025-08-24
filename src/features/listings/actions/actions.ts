'use server';

import { db } from '@/drizzle/db';
import { JobListingTable } from '@/drizzle/schema';
import {
  getCurrentOrganization,
  getCurrentUser,
} from '@/services/clerk/lib/get-current-auth';
import { hasOrgUserPermission } from '@/services/clerk/lib/org-user-permissions';
import { getMatchingJobListings } from '@/services/inngest/ai/get-matching-job-listings';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import z from 'zod';
import {
  deleteJobListing as deleteJobListingDb,
  insertJobListing,
  updateJobListing as updateJobListingDb,
} from '../db/jobListings';
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from '../lib/plan-feature-helpers';
import { getNextJobListingStatus } from '../lib/utils';
import { jobListingAiSearchSchema, jobListingSchema } from './schemas';

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission('job_listings:create'))) {
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: 'There was an error creating your job listing',
    };
  }

  const jobListing = await insertJobListing({
    ...data,
    organizationId: orgId,
    status: 'draft',
  });

  redirect(`/employer/job-listings/${jobListing.id}`);
}

export async function updateJobListing(
  id: string,
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission('job_listings:update'))) {
    return {
      error: true,
      message: "You don't have permission to update this job listing",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: 'There was an error updating your job listing',
    };
  }

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) {
    return {
      error: true,
      message: 'There was an error updating your job listing',
    };
  }

  const updatedJobListing = await updateJobListingDb(id, data);

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
}

export async function toggleJobListingStatus(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to update this job listing's status",
  };
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return error;

  const jobListing = await getJobListing(id, orgId);
  if (!jobListing) return error;

  const newStatus = getNextJobListingStatus(jobListing.status);
  if (
    !(await hasOrgUserPermission('job_listings:change_status')) ||
    (newStatus === 'published' && (await hasReachedMaxPublishedJobListings()))
  ) {
    return error;
  }

  await updateJobListingDb(id, {
    status: newStatus,
    isFeatured: newStatus === 'published' ? undefined : false,
    postedAt:
      newStatus === 'published' && jobListing.postedAt == null
        ? new Date()
        : undefined,
  });

  return { error: false };
}

export async function toggleJobListingFeatured(id: string) {
  const error = {
    error: true,
    message:
      "You don't have permission to update this job listing's featured status",
  };
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return error;

  const jobListing = await getJobListing(id, orgId);
  if (!jobListing) return error;

  const newFeaturedStatus = !jobListing.isFeatured;
  if (
    !(await hasOrgUserPermission('job_listings:change_status')) ||
    (newFeaturedStatus && (await hasReachedMaxFeaturedJobListings()))
  ) {
    return error;
  }

  await updateJobListingDb(id, {
    isFeatured: newFeaturedStatus,
  });

  return { error: false };
}

export async function deleteJobListing(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to delete this job listing",
  };
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return error;

  const jobListing = await getJobListing(id, orgId);
  if (!jobListing) return error;

  if (!(await hasOrgUserPermission('job_listings:delete'))) return error;

  await deleteJobListingDb(id);

  redirect(`/employer`);
}

export async function getAiJobListingSearchResults(
  query: z.infer<typeof jobListingAiSearchSchema>
): Promise<
  { error: true; message: string } | { error: false; jobIds: string[] }
> {
  const { success, data } = jobListingAiSearchSchema.safeParse(query);
  if (!success) {
    return {
      error: true,
      message: 'There was an error processing your search query',
    };
  }

  const { userId } = await getCurrentUser();
  if (!userId) {
    return {
      error: true,
      message: 'You need an account to use AI Job Search',
    };
  }

  const allListings = await getPublicJobListings();
  const matchedListings = await getMatchingJobListings(
    data.query,
    allListings,
    { maxNumberOfJobs: 10 }
  );

  if (matchedListings.length === 0) {
    return {
      error: true,
      message: 'No jobs match your search criteria',
    };
  }

  return {
    error: false,
    jobIds: matchedListings,
  };
}

async function getJobListing(id: string, orgId: string) {
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    ),
  });
}

async function getPublicJobListings() {
  return db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, 'published'),
  });
}
