'use client'

import { ArrowLeftIcon, CalendarIcon } from '@phosphor-icons/react'
import {
  RowsIcon,
  WaveformIcon,
  CommandIcon,
  UsersThreeIcon,
  RobotIcon,
  BookOpenIcon,
  GearIcon,
  CropIcon,
  ChartPieIcon,
  MapTrifoldIcon,
} from '@phosphor-icons/react'
import * as React from 'react'
import { authClient } from '@/lib/auth/auth-client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@repo/ui/sidebar'
import { Calendars } from './calendars'
import { DatePicker } from './date-picker'
import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

// This is sample data.
const data = {
  teams: [
    {
      name: 'Acme Inc',
      logo: <RowsIcon />,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: <WaveformIcon />,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: <CommandIcon />,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Membership',
      url: '#',
      icon: <UsersThreeIcon />,
      isActive: true,
      items: [
        {
          title: 'Student management',
          url: '#',
        },
        {
          title: 'Tenant management',
          url: '/tenants',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: <RobotIcon />,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: <BookOpenIcon />,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: <GearIcon />,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: <CropIcon />,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: <ChartPieIcon />,
    },
    {
      name: 'Travel',
      url: '#',
      icon: <MapTrifoldIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [view, setView] = React.useState<'workspace' | 'calendar'>('workspace')
  const { setOpen } = useSidebar()
  const { data: session } = authClient.useSession()
  const isCalendar = view === 'calendar'
  const isSuperAdmin = session?.user.role === 'admin'
  const navMain = data.navMain.map((item) => ({
    ...item,
    items: item.items?.filter(
      (subItem) => subItem.url !== '/tenants' || isSuperAdmin,
    ),
  }))

  return (
    <Sidebar {...props} collapsible={isCalendar ? 'offcanvas' : 'icon'}>
      <SidebarHeader>
        {isCalendar ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setView('workspace')}>
                <ArrowLeftIcon />
                <span>Back to workspace</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex h-10 items-center gap-2 px-2 font-semibold">
                <CalendarIcon className="size-4" />
                <span>Calendar</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <TeamSwitcher teams={data.teams} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <div hidden={isCalendar}>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Calendar"
                  onClick={() => {
                    setOpen(true)
                    setView('calendar')
                  }}
                >
                  <CalendarIcon />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <NavMain items={navMain} />
          <NavProjects projects={data.projects} />
        </div>
        {isCalendar && (
          <>
            <DatePicker />
            <SidebarSeparator className="mx-0" />
            <Calendars
              calendars={[
                { name: 'My calendars', items: ['Personal', 'Work', 'Tasks'] },
                { name: 'Other calendars', items: ['Holidays', 'Birthdays'] },
              ]}
            />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
