export const formatRoleDate = (value: string) =>
  new Date(value).toLocaleDateString()

export const formatRoleDateTime = (value: string) =>
  new Date(value).toLocaleString()

export const getRoleStatusBadgeClass = (isActive: boolean) =>
  isActive
    ? 'bg-green-500/10 text-green-600 border-green-500/20'
    : 'bg-gray-500/10 text-gray-600 border-gray-500/20'

export const getRoleStatusLabel = (isActive: boolean) =>
  isActive ? 'Active' : 'Inactive'
