import { useState } from 'react'
import { Upload, Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useAllDocuments } from '@/hooks/useDocuments'
import { DocumentStats } from '@/domains/admin/components/documents/DocumentStats'
import { DocumentsTable } from '@/domains/admin/components/documents/DocumentsTable'
import { UploadDocumentDialog } from '@/domains/admin/components/documents/UploadDocumentDialog'
import { calculateStorageStats } from '@/domains/admin/helpers/document.helpers'

export function DocumentPageUI() {
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const { data: response, isLoading } = useAllDocuments()

  const documents = response?.data || []
  const stats = calculateStorageStats(documents)

  // Filter documents by search query
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='min-h-screen p-6 space-y-8'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Document Management
          </h1>
          <p className='text-muted-foreground mt-2'>
            Manage, share, and track all your enterprise assets.
          </p>
        </div>
        <Button
          onClick={() => setUploadDialogOpen(true)}
          size='lg'
          className='gap-2'
        >
          <Upload className='h-5 w-5' />
          Upload New Document
        </Button>
      </div>

      {/* Stats Cards */}
      <DocumentStats
        totalDocuments={stats.totalCount}
        storageUsed={stats.totalSize}
        recentUploads={stats.recentUploadsToday}
      />

      {/* Search Bar */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search documents, folders, or owners...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-10 bg-muted/50'
        />
      </div>

      {/* Documents Table */}
      <DocumentsTable documents={filteredDocuments} isLoading={isLoading} />

      {/* Pagination Info */}
      {!isLoading && filteredDocuments.length > 0 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <p>
            Showing 1 to {filteredDocuments.length} of {documents.length}{' '}
            results
          </p>
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  )
}
