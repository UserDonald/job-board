import { BellIcon, FileUserIcon } from 'lucide-react';
import { SidebarNavMenuGroup } from './sidebar/sidebar-nav-menu-group';

export default function UserResumeSidebar() {
  return (
    <SidebarNavMenuGroup
      items={[
        {
          href: '/user-settings/notifications',
          icon: <BellIcon />,
          label: 'Notifications',
        },
        {
          href: '/user-settings/resume',
          icon: <FileUserIcon />,
          label: 'Resume',
        },
      ]}
    />
  );
}
