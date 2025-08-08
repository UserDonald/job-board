import { auth } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import { SidebarUserButtonClient } from './sidebar-user-button-client';

export function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  );
}

async function SidebarUserSuspense() {
  const { userId } = await auth();

  return (
    <SidebarUserButtonClient
      user={{
        email: 'contact.donaldnash@gmail.com',
        name: 'Donald Nash',
        imageUrl: '',
      }}
    />
  );
}
