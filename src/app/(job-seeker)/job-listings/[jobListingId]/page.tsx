import { ClientSheet } from '@/components/client-sheet';
import { IsBreakpoint } from '@/components/is-breakpoint';
import { LoadingSpinner } from '@/components/loading-spinner';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';
import { JobListingItems } from '@/components/shared/job-listing-items';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { db } from '@/drizzle/db';
import {
  JobListingApplicationTable,
  JobListingTable,
  UserResumeTable,
} from '@/drizzle/schema';
import { NewJobListingApplicationForm } from '@/features/applications/components/new-job-listing-application-form';
import { JobListingBadges } from '@/features/listings/components/job-listing-badges';
import { convertSearchParamsToString } from '@/lib/convert-search-params-to-string';
import { SignUpButton } from '@/services/clerk/components/auth-buttons';
import { getCurrentUser } from '@/services/clerk/lib/get-current-auth';
import { DialogDescription } from '@radix-ui/react-dialog';
import { differenceInDays } from 'date-fns';
import { and, eq } from 'drizzle-orm';
import { XIcon } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';

export default function JobListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  return (
    <>
      <ResizablePanelGroup autoSaveId="job-board-panel" direction="horizontal">
        <ResizablePanel id="left" order={1} defaultSize={60} minSize={30}>
          <div className="p-4 h-screen overflow-y-auto">
            <JobListingItems searchParams={searchParams} params={params} />
          </div>
        </ResizablePanel>
        <IsBreakpoint
          breakpoint="min-width: 1024px"
          otherwise={
            <ClientSheet>
              <SheetContent className="p-4" hideCloseButton>
                <SheetHeader className="sr-only">
                  <SheetTitle>Job Listing Details</SheetTitle>
                </SheetHeader>
                <Suspense fallback={<LoadingSpinner />}>
                  <JobListingDetails
                    params={params}
                    searchParams={searchParams}
                  />
                </Suspense>
              </SheetContent>
            </ClientSheet>
          }
        >
          <ResizableHandle withHandle className="mx-2" />
          <ResizablePanel id="right" order={2} defaultSize={40} minSize={30}>
            <div className="p-4 h-screen overflow-y-auto">
              <Suspense fallback={<LoadingSpinner />}>
                <JobListingDetails
                  params={params}
                  searchParams={searchParams}
                />
              </Suspense>
            </div>
          </ResizablePanel>
        </IsBreakpoint>
      </ResizablePanelGroup>
    </>
  );
}

async function JobListingDetails({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId);

  if (jobListing == null) return notFound();

  const nameInitials = jobListing.organization.name
    .split(' ')
    .slice(0, 4)
    .map((word) => word[0])
    .join('');

  return (
    <div className="space-y-6 @container">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="size-14 @max-md:hidden">
            <AvatarImage
              src={jobListing.organization.imageUrl ?? undefined}
              alt={jobListing.organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {jobListing.title}
            </h1>
            <div className="text-base text-muted-foreground">
              {jobListing.organization.name}
            </div>
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @min-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @max-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
            <Link
              href={`/?${convertSearchParamsToString(await searchParams)}`}
              className={buttonVariants({ variant: 'outline', size: 'icon' })}
            >
              <span className="sr-only">Close</span>
              <XIcon />
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <JobListingBadges jobListing={jobListing} />
        </div>
        <Suspense fallback={<Button disabled>Apply</Button>}>
          <ApplyButton jobListingId={jobListing.id} />
        </Suspense>
      </div>
      <MarkdownRenderer source={jobListing.description} className="prose-sm" />
    </div>
  );
}

async function ApplyButton({ jobListingId }: { jobListingId: string }) {
  const { userId } = await getCurrentUser();

  if (userId == null)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to create an account to apply for this job.
          <SignUpButton />
        </PopoverContent>
      </Popover>
    );

  const application = await getJobListingApplication({
    jobListingId,
    userId,
  });

  if (application != null) {
    const formatter = new Intl.RelativeTimeFormat(undefined, {
      style: 'short',
      numeric: 'always',
    });

    await connection();
    const difference = differenceInDays(application.createdAt, new Date());

    return (
      <div className="text-muted-foreground text-sm">
        You applied for this job{' '}
        {difference === 0 ? 'today' : formatter.format(difference, 'days')}
      </div>
    );
  }

  const userResume = await getUserResume(userId);

  if (userResume == null)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to upload a resume to apply for this job.
          <Link href="/resume" className={buttonVariants()}>
            Upload Resume
          </Link>
        </PopoverContent>
      </Popover>
    );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Apply</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Application</DialogTitle>
          <DialogDescription>
            Applying for a job cannot be undone and is something you can only do
            once per job listing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <NewJobListingApplicationForm jobListingId={jobListingId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function getUserResume(userId: string) {
  return await db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
  });
}

async function getJobListingApplication({
  jobListingId,
  userId,
}: {
  jobListingId: string;
  userId: string;
}) {
  return await db.query.JobListingApplicationTable.findFirst({
    where: and(
      eq(JobListingApplicationTable.jobListingId, jobListingId),
      eq(JobListingApplicationTable.userId, userId)
    ),
  });
}

async function getJobListing(id: string) {
  const listing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, 'published')
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  return listing;
}
