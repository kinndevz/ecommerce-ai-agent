export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const

export type HTTPMethodType = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD]

export const HTTP_METHOD_CONFIG: Record<
  HTTPMethodType,
  { label: string; className: string; badgeColor: string }
> = {
  GET: {
    label: 'GET',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    badgeColor: 'bg-blue-500',
  },
  POST: {
    label: 'POST',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
    badgeColor: 'bg-green-500',
  },
  PUT: {
    label: 'PUT',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    badgeColor: 'bg-amber-500',
  },
  PATCH: {
    label: 'PATCH',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    badgeColor: 'bg-purple-500',
  },
  DELETE: {
    label: 'DELETE',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
    badgeColor: 'bg-red-500',
  },
}
