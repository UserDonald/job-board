import { JobListingItems } from '@/components/shared/job-listing-items';

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  return (
    <div className="m-4">
      <JobListingItems searchParams={searchParams} />
    </div>
  );
}
