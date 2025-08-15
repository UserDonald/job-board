import { MarkdownPartial } from '@/components/markdown/markdown-partial';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { db } from '@/drizzle/db';
import { JobListingTable } from '@/drizzle/schema';
import { JobListingBadges } from '@/features/listings/components/job-listing-badges';
import { formatJobListingStatus } from '@/features/listings/lib/formatters';
import { getCurrentOrganization } from '@/services/clerk/lib/get-current-auth';
import { and, eq } from 'drizzle-orm';
import { EditIcon } from 'lucide-react';
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
          <Link
            href={`/employer/job-listings/${jobListing.id}/edit`}
            className={buttonVariants({ variant: 'outline' })}
          >
            <EditIcon className="size-4" />
            Edit
          </Link>
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

async function getJobListing(id: string, orgId: string) {
  const jobListing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    ),
  });

  return jobListing;
}
