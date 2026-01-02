// User Status Values (lowercase - matches API)
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const

export type UserStatusType = (typeof USER_STATUS)[keyof typeof USER_STATUS]

// User Role Values (lowercase - matches API)
export const USER_ROLE = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const

export type UserRoleType = (typeof USER_ROLE)[keyof typeof USER_ROLE]

// User Status Config for UI (use lowercase keys since USER_STATUS values are lowercase)
export const USER_STATUS_CONFIG: Record<
  UserStatusType,
  { label: string; className: string }
> = {
  active: {
    label: 'Active',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
}

// User Role Config for UI (use lowercase keys since USER_ROLE values are lowercase)
export const USER_ROLE_CONFIG: Record<
  UserRoleType,
  { label: string; className: string }
> = {
  admin: {
    label: 'Admin',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  manager: {
    label: 'Manager',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  staff: {
    label: 'Staff',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  customer: {
    label: 'Customer',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
}

// 2FA Status Config
export const TFA_STATUS_CONFIG = {
  enabled: {
    label: 'Enabled',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  disabled: {
    label: 'Disabled',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
} as const
