import { Link, useLocation } from 'react-router-dom';
import { CirclePlusIcon, MailIcon } from 'lucide-react';

import { cn } from '@shared/lib/utils';
import { buttonVariants } from '@shared/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shared/ui/sidebar';

type NavMainItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  end?: boolean;
};

function isNavActive(pathname: string, url: string, end?: boolean) {
  if (end || url === '/dashboard') {
    return pathname === url;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Создать интервью"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              render={<Link to="/dashboard/interviews/create" />}
            >
              <CirclePlusIcon />
              <span>Быстрое создание</span>
            </SidebarMenuButton>
            <Link
              to="/dashboard/candidates"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon' }),
                'size-8 group-data-[collapsible=icon]:opacity-0',
              )}
            >
              <MailIcon />
              <span className="sr-only">Кандидаты</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isNavActive(pathname, item.url, item.end)}
                render={<Link to={item.url} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
