import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, FileText, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/shared/components/ui/form'
import { useUploadDocument } from '@/hooks/useDocuments'
import { formatFileSize } from '@/domains/admin/helpers/document.helpers'

const ALLOWED_FILE_TYPES = ['pdf', 'docx', 'xlsx', 'xls']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'File is required')
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`
    )
    .refine((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      return extension && ALLOWED_FILE_TYPES.includes(extension)
    }, `File type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`),
})

type UploadFormData = z.infer<typeof uploadSchema>

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
}: UploadDocumentDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { mutate: uploadDocument, isPending } = useUploadDocument()

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      form.setValue('file', file)

      // Auto-fill title from filename if empty
      if (!form.getValues('title')) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        form.setValue('title', nameWithoutExt)
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    form.setValue('file', null as any)
  }

  const onSubmit = (data: UploadFormData) => {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('title', data.title)
    if (data.description) {
      formData.append('description', data.description)
    }

    uploadDocument(formData, {
      onSuccess: () => {
        onOpenChange(false)
        form.reset()
        setSelectedFile(null)
      },
    })
  }

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false)
      form.reset()
      setSelectedFile(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-150'>
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Upload a document to add it to your knowledge base. Supported
            formats: PDF, DOCX, XLSX, XLS
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* File Upload */}
            <FormField
              control={form.control}
              name='file'
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <div className='space-y-4'>
                      {!selectedFile ? (
                        <div className='relative'>
                          <input
                            type='file'
                            accept='.pdf,.docx,.xlsx,.xls'
                            onChange={handleFileChange}
                            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                            disabled={isPending}
                            {...field}
                          />
                          <div className='border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer'>
                            <Upload className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                            <p className='text-sm font-medium mb-1'>
                              Click to upload or drag and drop
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              PDF, DOCX, XLSX, XLS (max{' '}
                              {formatFileSize(MAX_FILE_SIZE)})
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className='border border-border rounded-lg p-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div className='p-2 bg-blue-500/10 rounded-lg'>
                                <FileText className='h-6 w-6 text-blue-500' />
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium truncate'>
                                  {selectedFile.name}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  {formatFileSize(selectedFile.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={handleRemoveFile}
                              disabled={isPending}
                              className='shrink-0'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter document title'
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive title for your document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter document description'
                      rows={3}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional details about this document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending || !selectedFile}>
                {isPending ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className='mr-2 h-4 w-4' />
                    Upload Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
