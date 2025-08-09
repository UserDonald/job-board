import { SidebarMenuButton } from '@/components/ui/sidebar';
import { SignOutButton } from '@/services/clerk/components/auth-buttons';
import {
  getCurrentOrganization,
  getCurrentUser,
} from '@/services/clerk/lib/get-current-auth';
import { LogOutIcon } from 'lucide-react';
import { Suspense } from 'react';
import { SidebarOrganizationButtonClient } from './sidebar-organization-button-client';

export function SidebarOrganizationButton() {
  return (
    <Suspense>
      <SidebarOrganizationSuspense />
    </Suspense>
  );
}

async function SidebarOrganizationSuspense() {
  const [{ organization }, { user }] = await Promise.all([
    getCurrentOrganization(),
    getCurrentUser({ allData: true }),
  ]);

  if (!organization || !user) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return (
    <SidebarOrganizationButtonClient
      organization={organization}
      user={user}
    />
  );
}
