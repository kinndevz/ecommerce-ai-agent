import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { AppSidebar } from '../sidebar/app-sidebar'
import { SiteHeader } from '../sidebar/site-header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      {/* 1. Sidebar chính bên trái */}
      <AppSidebar />

      {/* 2. Phần nội dung chính (Inset) */}
      <SidebarInset>
        {/* Header nằm trên cùng */}
        <SiteHeader />

        {/* Khu vực chứa nội dung thay đổi (Dashboard, Users, Settings...) */}
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
