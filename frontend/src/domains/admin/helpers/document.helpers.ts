import { format } from 'date-fns'
import { FileText, FileSpreadsheet, File, type LucideIcon } from 'lucide-react'

/**
 * Format file size from bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Get file type icon and color based on extension
 */
export function getFileTypeConfig(fileType: string): {
  icon: LucideIcon
  bgColor: string
  iconColor: string
} {
  const type = fileType.toLowerCase()

  switch (type) {
    case 'pdf':
      return {
        icon: FileText,
        bgColor: 'bg-red-500/10',
        iconColor: 'text-red-500',
      }
    case 'docx':
    case 'doc':
      return {
        icon: FileText,
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
      }
    case 'xlsx':
    case 'xls':
      return {
        icon: FileSpreadsheet,
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-500',
      }
    default:
      return {
        icon: File,
        bgColor: 'bg-muted',
        iconColor: 'text-muted-foreground',
      }
  }
}

/**
 * Get file type badge config for table display
 */
export function getFileTypeBadgeConfig(fileType: string): {
  label: string
  className: string
} {
  const type = fileType.toLowerCase()

  switch (type) {
    case 'pdf':
      return {
        label: 'PDF',
        className:
          'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold',
      }
    case 'docx':
      return {
        label: 'DOCX',
        className:
          'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold',
      }
    case 'doc':
      return {
        label: 'DOC',
        className:
          'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold',
      }
    case 'xlsx':
      return {
        label: 'XLSX',
        className:
          'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold',
      }
    case 'xls':
      return {
        label: 'XLS',
        className:
          'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold',
      }
    default:
      return {
        label: type.toUpperCase(),
        className:
          'border-muted-foreground/50 bg-muted text-muted-foreground font-semibold',
      }
  }
}

/**
 * Format document date
 */
export function formatDocumentDate(dateString: string): string {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

/**
 * Format document time
 */
export function formatDocumentTime(dateString: string): string {
  return format(new Date(dateString), 'hh:mm a')
}

/**
 * Get status badge config
 */
export function getDocumentStatusConfig(isActive: boolean): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
} {
  if (isActive) {
    return {
      label: 'Published',
      variant: 'outline',
      className:
        'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400',
    }
  }

  return {
    label: 'Draft',
    variant: 'outline',
    className:
      'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  }
}

/**
 * Calculate storage stats
 */
export function calculateStorageStats(documents: any[]) {
  const totalSize = documents.reduce(
    (acc, doc) => acc + (doc.file_size || 0),
    0
  )
  const totalCount = documents.length

  // Count recent uploads today
  const recentUploadsToday = documents.filter((doc) => {
    const createdDate = new Date(doc.created_at)
    const today = new Date()
    return createdDate.toDateString() === today.toDateString()
  }).length

  return {
    totalCount,
    totalSize: formatFileSize(totalSize),
    recentUploadsToday,
  }
}
