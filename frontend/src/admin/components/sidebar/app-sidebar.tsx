import * as React from 'react'
import {
  IconCategory2,
  IconHelp,
  IconLayoutDashboard,
  IconPackage,
  IconSearch,
  IconSettings,
  IconTruckDelivery,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react'

import { NavDocuments } from '@/admin/components/sidebar/nav-documents'
import { NavMain } from '@/admin/components/sidebar/nav-main'
import { NavSecondary } from '@/admin/components/sidebar/nav-secondary'
import { NavUser } from '@/admin/components/sidebar/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar'
import { Link } from 'react-router-dom'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: IconLayoutDashboard,
    },
    {
      title: 'Products ',
      url: '/admin/products',
      icon: IconPackage,
    },
    {
      title: 'Brands ',
      url: '/admin/brands',
      icon: IconWorld,
    },
    {
      title: 'Categories ',
      url: '/admin/categories',
      icon: IconCategory2,
    },
    {
      title: 'Orders ',
      url: '/admin/orders',
      icon: IconTruckDelivery,
    },
    {
      title: 'Users ',
      url: '/admin/users',
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: IconHelp,
    },
    {
      title: 'Search',
      url: '#',
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:p-1.5!'
            >
              <Link to='/' className='flex items-center gap-3'>
                <img
                  src='/src/assets/company-logo.svg'
                  alt='BeautyShop'
                  className='h-6 w-auto'
                />
                <span className='text-base font-semibold'>BeautyShop</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
