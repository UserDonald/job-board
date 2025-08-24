import { AsyncIf } from '@/components/async-if';
import { LoadingSwap } from '@/components/loading-swap';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { JobListingAiSearchForm } from '@/features/listings/components/job-listing-ai-search-form';
import { SignUpButton } from '@/services/clerk/components/auth-buttons';
import { getCurrentUser } from '@/services/clerk/lib/get-current-auth';

export default function AiSearchPage() {
  return (
    <div className="p-4 flex items-center justify-center min-h-full">
      <Card className="max-w-4xl">
        <AsyncIf
          condition={async () => {
            const { userId } = await getCurrentUser();
            return userId != null;
          }}
          fallback={
            <LoadingSwap isLoading>
              <AiCard />
            </LoadingSwap>
          }
          otherwise={<NoPermission />}
        >
          <AiCard />
        </AsyncIf>
      </Card>
    </div>
  );
}

function AiCard() {
  return (
    <>
      <CardHeader>
        <CardTitle>AI Search</CardTitle>
        <CardDescription>
          This can take a few minutes to process, so please be patient.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JobListingAiSearchForm />
      </CardContent>
    </>
  );
}

function NoPermission() {
  return (
    <CardContent className="text-center">
      <h2 className="text-xl font-bold mb-1">Permission Denied</h2>
      <p className="mb-4 text-muted-foreground">
        You need to create an account before using AI Search
      </p>
      <SignUpButton />
    </CardContent>
  );
}
