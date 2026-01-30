import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'

interface ClearCartDialogProps {
  onConfirm: () => void
  isPending: boolean
}

export function ClearCartDialog({
  onConfirm,
  isPending,
}: ClearCartDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Clear Cart
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='max-w-100 rounded-2xl'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-xl'>
            Empty your cart?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all items from your shopping bag. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-2 sm:gap-0'>
          <AlertDialogCancel className='rounded-md'>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className='ml-2 bg-destructive hover:bg-destructive/90 text-white rounded-md'
          >
            {isPending ? 'Clearing...' : 'Yes, Clear All'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
