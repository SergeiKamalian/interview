import { Link } from 'react-router-dom';
import { FolderIcon, MoreHorizontalIcon, ShareIcon, Trash2Icon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@shared/ui/sidebar';

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: React.ReactNode;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Ресурсы</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton render={<Link to={item.url} />}>
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  />
                }
              >
                <MoreHorizontalIcon />
                <span className="sr-only">Ещё</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem disabled>
                  <FolderIcon />
                  <span>Открыть</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <ShareIcon />
                  <span>Поделиться</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" disabled>
                  <Trash2Icon />
                  <span>Удалить</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
