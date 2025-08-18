import JobListingFilterForm from '@/features/listings/components/job-listing-filter-form';
import { SidebarGroup, SidebarGroupContent } from '../ui/sidebar';

export default function JobBoardSidebar() {
  return (
    <SidebarGroup className="group-data-[state=collapsed]:hidden">
      <SidebarGroupContent className="px-1">
        <JobListingFilterForm />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
