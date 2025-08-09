'use client';

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    SignedIn,
    SignedOut,
} from '@/services/clerk/components/sign-in-status';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SidebarNavMenuGroup({
  items,
  className,
}: {
  items: {
    href: string;
    icon: React.ReactNode;
    label: string;
    authStatus?: 'signed-in' | 'signed-out';
  }[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className={className}>
      <SidebarMenu>
        {items.map((item, index) => {
          const html = (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild isActive={item.href === pathname}>
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );

          if (item.authStatus === 'signed-out') {
            return <SignedOut key={index}>{html}</SignedOut>;
          }

          if (item.authStatus === 'signed-in') {
            return <SignedIn key={index}>{html}</SignedIn>;
          }

          return html;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
