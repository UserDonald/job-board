import {
    SignedIn as ClerkSignedIn,
    SignedOut as ClerkSignedOut,
} from '@clerk/nextjs';
import { ReactNode, Suspense } from 'react';

export function SignedOut({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ClerkSignedOut>{children}</ClerkSignedOut>
    </Suspense>
  );
}

export function SignedIn({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ClerkSignedIn>{children}</ClerkSignedIn>
    </Suspense>
  );
}
