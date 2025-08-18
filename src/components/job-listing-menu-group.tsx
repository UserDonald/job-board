'use client';

import { JobListingStatus, JobListingTable } from '@/drizzle/schema';
import { formatJobListingStatus } from '@/features/listings/lib/formatters';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from './ui/collapsible';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from './ui/sidebar';

type JobListing = Pick<typeof JobListingTable.$inferSelect, 'id' | 'title'> & {
  applicationsCount: number;
};

export function JobListingMenuGroup({
  status,
  jobListings,
}: {
  status: JobListingStatus;
  jobListings: JobListing[];
}) {
  const { jobListingId } = useParams();

  return (
    <SidebarMenu>
      <Collapsible
        defaultOpen={
          status !== 'delisted' ||
          jobListings.find((job) => job.id === jobListingId) !== undefined
        }
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              {formatJobListingStatus(status)}
              <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {jobListings.map((jobListing) => (
                <JobListingMenuItem key={jobListing.id} {...jobListing} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}

function JobListingMenuItem({ id, title, applicationsCount }: JobListing) {
  const { jobListingId } = useParams();

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        isActive={jobListingId === id}
        className="group-data-[collapsible=icon]:hidden"
      >
        <Link href={`/employer/job-listings/${id}`}>
          <span className="truncate">{title}</span>
        </Link>
      </SidebarMenuSubButton>
      {applicationsCount > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {applicationsCount}
        </div>
      )}
    </SidebarMenuSubItem>
  );
}
