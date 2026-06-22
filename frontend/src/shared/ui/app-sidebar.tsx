import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  CircleHelpIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  ListIcon,
  ListChecksIcon,
  UsersIcon,
} from 'lucide-react';

import { env } from '@shared/config/env';
import { NavDocuments } from '@shared/ui/nav-documents';
import { NavMain } from '@shared/ui/nav-main';
import { NavSecondary } from '@shared/ui/nav-secondary';
import { NavUser } from '@shared/ui/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shared/ui/sidebar';

const navMain = [
  {
    title: 'Дашборд',
    url: '/dashboard',
    end: true,
    icon: <LayoutDashboardIcon />,
  },
  {
    title: 'Интервью',
    url: '/dashboard/interviews',
    end: true,
    icon: <ListIcon />,
  },
  {
    title: 'Очередь проверки',
    url: '/dashboard/review',
    icon: <ListChecksIcon />,
  },
  {
    title: 'Кандидаты',
    url: '/dashboard/candidates',
    icon: <UsersIcon />,
  },
  {
    title: 'Аналитика',
    url: '/dashboard/analytics',
    icon: <ChartBarIcon />,
  },
];

const documents = [
  {
    name: 'Банк вопросов',
    url: '/dashboard/question-bank',
    icon: <DatabaseIcon />,
  },
  {
    name: 'Отчёты',
    url: '/dashboard/analytics',
    icon: <FileChartColumnIcon />,
  },
];

const navSecondary = [
  {
    title: 'Помощь',
    url: '#',
    icon: <CircleHelpIcon />,
  },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  companyName?: string;
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  onLogout?: () => void;
  isLoggingOut?: boolean;
};

export function AppSidebar({
  companyName = env.appName,
  user,
  onLogout,
  isLoggingOut,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link to="/dashboard" />}
            >
              <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <span className="text-base font-semibold">{companyName}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <NavUser
            user={user}
            onLogout={onLogout}
            isLoggingOut={isLoggingOut}
          />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
