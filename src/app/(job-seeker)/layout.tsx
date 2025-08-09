import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarNavMenuGroup } from '@/components/sidebar/sidebar-nav-menu-group';
import { SidebarUserButton } from '@/features/users/components/sidebar-user-button';
import {
  BrainCircuitIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LogInIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

export default function JobSeekerLayout({ children }: { children: ReactNode }) {
  return (
    <AppSidebar
      content={
        <SidebarNavMenuGroup
          className="mt-auto"
          items={[
            {
              href: '/',
              label: 'Job Board',
              icon: <ClipboardListIcon />,
            },
            {
              href: '/ai-search',
              label: 'AI Search',
              icon: <BrainCircuitIcon />,
            },
            {
              href: '/employer',
              label: 'Employer Dashboard',
              icon: <LayoutDashboardIcon />,
              authStatus: 'signed-in',
            },
            {
              href: '/sign-in',
              label: 'Sign In',
              icon: <LogInIcon />,
              authStatus: 'signed-out',
            },
          ]}
        />
      }
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSidebar>
  );
}
