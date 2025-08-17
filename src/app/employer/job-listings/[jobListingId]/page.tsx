import { ActionButton } from '@/components/action-button';
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
import {
  deleteJobListing,
  toggleJobListingFeatured,
  toggleJobListingStatus,
} from '@/features/listings/actions/actions';
import { JobListingBadges } from '@/features/listings/components/job-listing-badges';
import { formatJobListingStatus } from '@/features/listings/lib/formatters';
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from '@/features/listings/lib/plan-feature-helpers';
import { getNextJobListingStatus } from '@/features/listings/lib/utils';
import { getCurrentOrganization } from '@/services/clerk/lib/get-current-auth';
import { hasOrgUserPermission } from '@/services/clerk/lib/org-user-permissions';
import { and, eq } from 'drizzle-orm';
import {
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  StarIcon,
  StarOffIcon,
  Trash2Icon,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

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
          <AsyncIf
            condition={() => hasOrgUserPermission('job_listings:delete')}
          >
            <ActionButton
              action={deleteJobListing.bind(null, jobListing.id)}
              variant="destructive"
              requireAreYouSure
              areYouSureDescription="This will immediately delete this job listing and all associated data."
            >
              <Trash2Icon className="size-4" />
              Delete
            </ActionButton>
          </AsyncIf>
          <StatusUpdateButton status={jobListing.status} id={jobListing.id} />
          {jobListing.status === 'published' && (
            <FeaturedToggleButton
              isFeatured={jobListing.isFeatured}
              id={jobListing.id}
            />
          )}
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

function StatusUpdateButton({
  status,
  id,
}: {
  status: JobListingStatus;
  id: string;
}) {
  const button = (
    <ActionButton
      action={toggleJobListingStatus.bind(null, id)}
      variant="outline"
      requireAreYouSure={getNextJobListingStatus(status) === 'published'}
      areYouSureDescription="This will immediately show this job listing to all users."
    >
      {statusToggleButtonText(status)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission('job_listings:change_status')}
    >
      {getNextJobListingStatus(status) === 'published' ? (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxPublishedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={statusToggleButtonText(status)}
              popoverText="You must upgrade your plan to publish more job listings."
            />
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

function FeaturedToggleButton({
  isFeatured,
  id,
}: {
  isFeatured: boolean;
  id: string;
}) {
  const button = (
    <ActionButton
      action={toggleJobListingFeatured.bind(null, id)}
      variant="outline"
    >
      {featuredToggleButtonText(isFeatured)}
    </ActionButton>
  );

  return (
    <AsyncIf
      condition={() => hasOrgUserPermission('job_listings:change_status')}
    >
      {isFeatured ? (
        button
      ) : (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={featuredToggleButtonText(isFeatured)}
              popoverText="You must upgrade your plan to feature more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      )}
    </AsyncIf>
  );
}

function UpgradePopover({
  buttonText,
  popoverText,
}: {
  buttonText: ReactNode;
  popoverText: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {popoverText}
        <Button asChild>
          <Link href="/employer/pricing">Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
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
      throw new Error(`Unknown status: ${status satisfies never}`);
  }
}

function featuredToggleButtonText(isFeatured: boolean) {
  if (isFeatured) {
    return (
      <>
        <StarOffIcon className="size-4" />
        Unfeature
      </>
    );
  }

  return (
    <>
      <StarIcon className="size-4" />
      Feature
    </>
  );
}

async function getJobListing(id: string, orgId: string) {
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    ),
  });
}
