import { useState } from 'react'
import { MoreVertical, Download, Trash2, ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { DocumentBase } from '@/api/document.api'
import {
  formatFileSize,
  getFileTypeConfig,
  formatDocumentDate,
  getDocumentStatusConfig,
  getFileTypeBadgeConfig,
} from '@/domains/admin/helpers/document.helpers'
import { DocumentsTableSkeleton } from './DocumentsTableSkeleton'
import { DocumentsEmptyState } from './DocumentsEmptyState'
import { DeleteDocumentDialog } from './DeleteDocumentDialog'

interface DocumentsTableProps {
  documents: DocumentBase[]
  isLoading: boolean
}

export function DocumentsTable({ documents, isLoading }: DocumentsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentBase | null>(
    null
  )

  const handleDeleteClick = (document: DocumentBase) => {
    setSelectedDocument(document)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return <DocumentsTableSkeleton />
  }

  if (documents.length === 0) {
    return <DocumentsEmptyState />
  }

  return (
    <>
      <div className='rounded-xl border border-border overflow-hidden bg-card shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50 hover:bg-muted/50'>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Document Name
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Upload Date
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Size
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                File Type
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Status
              </TableHead>
              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => {
              const fileConfig = getFileTypeConfig(document.file_type)
              const statusConfig = getDocumentStatusConfig(document.is_active)
              const fileTypeBadge = getFileTypeBadgeConfig(document.file_type)
              const Icon = fileConfig.icon

              return (
                <TableRow key={document.id} className='hover:bg-muted/30'>
                  {/* Document Name */}
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div className={`p-2.5 rounded-lg ${fileConfig.bgColor}`}>
                        <Icon className={`h-5 w-5 ${fileConfig.iconColor}`} />
                      </div>
                      <div className='min-w-0'>
                        <p className='font-medium text-foreground truncate'>
                          {document.title}
                        </p>
                        {document.description && (
                          <p className='text-sm text-muted-foreground truncate'>
                            {document.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Upload Date */}
                  <TableCell>
                    <span className='text-sm text-foreground'>
                      {formatDocumentDate(document.created_at)}
                    </span>
                  </TableCell>

                  {/* Size */}
                  <TableCell>
                    <span className='text-sm text-foreground'>
                      {formatFileSize(Number(document.file_size) || 0)}
                    </span>
                  </TableCell>

                  {/* File Type */}
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={fileTypeBadge.className}
                    >
                      {fileTypeBadge.label}
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={statusConfig.variant}
                      className={statusConfig.className}
                    >
                      {statusConfig.label}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => window.open(document.s3_url, '_blank')}
                        >
                          <ExternalLink className='h-4 w-4 mr-2' />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const link = window.document.createElement('a')
                            link.href = document.s3_url
                            link.download = document.title
                            link.click()
                          }}
                        >
                          <Download className='h-4 w-4 mr-2' />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(document)}
                          className='text-destructive focus:text-destructive'
                        >
                          <Trash2 className='h-4 w-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <DeleteDocumentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        document={selectedDocument}
      />
    </>
  )
}
