export const getRatingColor = (star: number): string => {
  switch (star) {
    case 5:
      return 'bg-emerald-500'
    case 4:
      return 'bg-teal-400'
    case 3:
      return 'bg-yellow-400'
    case 2:
      return 'bg-orange-400'
    case 1:
      return 'bg-red-500'
    default:
      return 'bg-gray-200'
  }
}

export const calculatePercentage = (count: number, total: number): number => {
  if (total === 0) return 0
  return (count / total) * 100
}
