// User Status Values (UPPERCASE - matches API)
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED', // If backend doesn't support, remove this
} as const

export type UserStatusType = (typeof USER_STATUS)[keyof typeof USER_STATUS]

// User Role Values (UPPERCASE - matches API)
export const USER_ROLE = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
} as const

export type UserRoleType = (typeof USER_ROLE)[keyof typeof USER_ROLE]

// User Status Config for UI (UPPERCASE keys to match API values)
export const USER_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
  SUSPENDED: {
    label: 'Suspended',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
}

// User Role Config for UI (UPPERCASE keys to match API values)
export const USER_ROLE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  ADMIN: {
    label: 'Admin',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  CUSTOMER: {
    label: 'Customer',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
  SELLER: {
    label: 'Seller',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
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
