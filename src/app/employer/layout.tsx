import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarNavMenuGroup } from '@/components/sidebar/sidebar-nav-menu-group';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { SidebarOrganizationButton } from '@/features/organization/components/sidebar-organization-button';
import { getCurrentOrganization } from '@/services/clerk/lib/get-current-auth';
import { ClipboardListIcon, LogInIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <LayoutSuspense>{children}</LayoutSuspense>
    </Suspense>
  );
}

async function LayoutSuspense({ children }: { children: ReactNode }) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) redirect('/organization/select');

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <SidebarGroupAction title="Add Job Listing">
              <Link href="/employer/job-listings/new">
                <PlusIcon /> <span className="sr-only">Add Job Listing</span>
              </Link>
            </SidebarGroupAction>
          </SidebarGroup>
          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              {
                href: '/',
                label: 'Job Board',
                icon: <ClipboardListIcon />,
              },
              {
                href: '/sign-in',
                label: 'Sign In',
                icon: <LogInIcon />,
                authStatus: 'signed-out',
              },
            ]}
          />
        </>
      }
      footerButton={<SidebarOrganizationButton />}
    >
      {children}
    </AppSidebar>
  );
}
