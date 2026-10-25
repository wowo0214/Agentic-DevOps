'use client'

import { ArrowLeftIcon, CalendarIcon } from '@phosphor-icons/react'
import {
  RowsIcon,
  WaveformIcon,
  CommandIcon,
} from '@phosphor-icons/react'
import * as React from 'react'
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
}

export function AppSidebar({ navigation, ...props }: React.ComponentProps<typeof Sidebar> & { navigation: React.ReactNode }) {
  const [view, setView] = React.useState<'workspace' | 'calendar'>('workspace')
  const { setOpen } = useSidebar()
  const isCalendar = view === 'calendar'

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
          {navigation}
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
