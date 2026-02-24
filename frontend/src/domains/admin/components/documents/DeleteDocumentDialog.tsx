import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { useDeleteDocument } from '@/hooks/useDocuments'
import type { DocumentBase } from '@/api/document.api'

interface DeleteDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: DocumentBase | null
}

export function DeleteDocumentDialog({
  open,
  onOpenChange,
  document,
}: DeleteDocumentDialogProps) {
  const { mutate: deleteDocument, isPending } = useDeleteDocument()

  const handleDelete = () => {
    if (!document) return

    deleteDocument(document.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  if (!document) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className='font-semibold text-foreground'>
              "{document.title}"
            </span>
            ? This action cannot be undone and will permanently remove the
            document and all its associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className='bg-destructive hover:bg-destructive/90'
          >
            {isPending ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
