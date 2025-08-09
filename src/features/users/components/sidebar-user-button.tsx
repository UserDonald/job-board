import { SidebarMenuButton } from '@/components/ui/sidebar';
import { SignOutButton } from '@/services/clerk/components/auth-buttons';
import { getCurrentUser } from '@/services/clerk/lib/get-current-auth';
import { LogOutIcon } from 'lucide-react';
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
  const { user } = await getCurrentUser({ allData: true });

  if (!user) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return <SidebarUserButtonClient user={user} />;
}
