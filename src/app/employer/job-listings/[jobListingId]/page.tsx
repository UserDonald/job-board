import { AsyncIf } from '@/components/async-if';
import { MarkdownPartial } from '@/components/markdown/markdown-partial';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { db } from '@/drizzle/db';
import { JobListingStatus, JobListingTable } from '@/drizzle/schema';
import { JobListingBadges } from '@/features/listings/components/job-listing-badges';
import { formatJobListingStatus } from '@/features/listings/lib/formatters';
import { hasReachedMaxFeaturedJobListings } from '@/features/listings/lib/plan-feature-helpers';
import { getNextJobListingStatus } from '@/features/listings/lib/utils';
import { getCurrentOrganization } from '@/services/clerk/lib/get-current-auth';
import { hasOrgUserPermission } from '@/services/clerk/lib/org-user-permissions';
import { and, eq } from 'drizzle-orm';
import { EditIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ jobListingId: string }>;
};

export default async function JobListingPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
}

async function SuspendedPage({ params }: Props) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
    return <div>You don&apos;t have permission to view this job listing</div>;
  }

  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId, orgId);

  if (!jobListing) {
    return notFound();
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>
        <div className="flex items-center gap-2 empty:-mt-4">
          <AsyncIf
            condition={() => hasOrgUserPermission('job_listings:update')}
          >
            <Link
              href={`/employer/job-listings/${jobListing.id}/edit`}
              className={buttonVariants({ variant: 'outline' })}
            >
              <EditIcon className="size-4" />
              Edit
            </Link>
          </AsyncIf>
          <StatusUpdateButton status={jobListing.status} />
        </div>
      </div>
      <MarkdownPartial
        dialogMarkdown={
          <MarkdownRenderer
            className="prose-sm"
            source={jobListing.description}
          />
        }
        mainMarkdown={
          <MarkdownRenderer
            className="prose-sm"
            source={jobListing.description}
          />
        }
        dialogTitle="Description"
      />
    </div>
  );
}

function StatusUpdateButton({ status }: { status: JobListingStatus }) {
  const button = <Button variant="outline">Toggle</Button>;

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission('job_listings:change_status')}
    >
      {getNextJobListingStatus(status) === 'published' ? (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {statusToggleButtonText(status)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-2">
                You must upgrade your plan to publish more job listings.
                <Link
                  href="/employer/pricing"
                  className={buttonVariants({ variant: 'outline' })}
                >
                  Upgrade Plan
                </Link>
              </PopoverContent>
            </Popover>
          }
        >
          {button}
        </AsyncIf>
      ) : (
        button
      )}
    </AsyncIf>
  );
}

async function getJobListing(id: string, orgId: string) {
  const jobListing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    ),
  });

  return jobListing;
}

function statusToggleButtonText(status: JobListingStatus) {
  switch (status) {
    case 'delisted':
    case 'draft':
      return (
        <>
          <EyeIcon className="size-4" />
          Publish
        </>
      );
    case 'published':
      return (
        <>
          <EyeOffIcon className="size-4" />
          Delist
        </>
      );
    default:
      throw new Error(`Invalid job listing status: ${status satisfies never}`);
  }
}
