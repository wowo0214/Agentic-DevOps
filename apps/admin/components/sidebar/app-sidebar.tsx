"use client"

import * as React from "react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import { DatePicker } from "./date-picker"
import { Calendars } from "./calendars"
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
} from "@repo/ui/sidebar"
import { ArrowLeftIcon, CalendarIcon } from "@phosphor-icons/react"
import { RowsIcon, WaveformIcon, CommandIcon, TerminalIcon, RobotIcon, BookOpenIcon, GearIcon, CropIcon, ChartPieIcon, MapTrifoldIcon } from "@phosphor-icons/react"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: (
        <RowsIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <WaveformIcon
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <CommandIcon
        />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: (
        <TerminalIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: (
        <RobotIcon
        />
      ),
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: (
        <GearIcon
        />
      ),
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <CropIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <ChartPieIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapTrifoldIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [view, setView] = React.useState<"workspace" | "calendar">("workspace")
  const { setOpen } = useSidebar()
  const isCalendar = view === "calendar"

  return (
    <Sidebar {...props} collapsible={isCalendar ? "offcanvas" : "icon"}>
      <SidebarHeader>
        {isCalendar ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setView("workspace")}>
                <ArrowLeftIcon />
                <span>返回工作区</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex h-10 items-center gap-2 px-2 font-semibold">
                <CalendarIcon className="size-4" />
                <span>日历</span>
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
                  tooltip="日历"
                  onClick={() => {
                    setOpen(true)
                    setView("calendar")
                  }}
                >
                  <CalendarIcon />
                  <span>日历</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <NavMain items={data.navMain} />
          <NavProjects projects={data.projects} />
        </div>
        {isCalendar && (
          <>
            <DatePicker />
            <SidebarSeparator className="mx-0" />
            <Calendars calendars={[
              { name: "我的日历", items: ["个人", "工作", "待办"] },
              { name: "其他日历", items: ["节假日", "生日"] },
            ]} />
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
