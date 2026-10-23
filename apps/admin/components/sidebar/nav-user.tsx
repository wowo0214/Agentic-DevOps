'use client'

import {
  SparkleIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BellIcon,
} from '@phosphor-icons/react'
import { UserButton } from '@repo/ui/auth'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@repo/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuItem, useSidebar } from '@repo/ui/sidebar'

export function NavUser() {
  const { isMobile, state } = useSidebar()
  const isCollapsed = !isMobile && state === 'collapsed'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserButton
          aria-label="User menu"
          className={
            isCollapsed
              ? 'flex size-8 items-center justify-center'
              : 'w-full justify-start px-2 aria-expanded:bg-muted'
          }
          size={isCollapsed ? 'icon' : 'default'}
          side={isMobile ? 'bottom' : 'right'}
          align="end"
          sideOffset={4}
          links={[
            <DropdownMenuGroup key="upgrade">
              <DropdownMenuItem>
                <SparkleIcon />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>,
            <DropdownMenuSeparator key="upgrade-separator" />,
            {
              label: 'Account',
              href: '/settings/account',
              icon: <CheckCircleIcon />,
              visibility: 'authenticated',
            },
          ]}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
