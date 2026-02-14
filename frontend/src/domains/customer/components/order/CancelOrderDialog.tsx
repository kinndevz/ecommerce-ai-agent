import { AlertTriangle } from 'lucide-react'
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

interface CancelOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: CancelOrderDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='max-w-md'>
        <AlertDialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center'>
              <AlertTriangle className='h-6 w-6 text-destructive' />
            </div>
            <AlertDialogTitle className='text-xl'>
              Xác nhận hủy đơn hàng
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className='text-base leading-relaxed pt-2'>
            Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn
            tác và đơn hàng sẽ bị hủy vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-2 sm:gap-2'>
          <AlertDialogCancel
            disabled={isPending}
            className='flex-1 sm:flex-none'
          >
            Quay lại
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className='flex-1 sm:flex-none bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isPending ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent'></div>
                Đang hủy...
              </>
            ) : (
              'Xác nhận hủy'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
