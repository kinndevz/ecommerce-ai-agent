import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
} from '@/shared/components/ui/form'
import { RatingStars } from './RatingStars'
import { EmojiButton } from './EmojiButton'
import type { CreateReviewRequest } from '@/api/types/review.types'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao').max(5),
  title: z
    .string()
    .min(3, 'Tiêu đề phải có ít nhất 3 ký tự')
    .max(100)
    .optional()
    .nullable(),
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự').max(2000),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  onSubmit: (data: CreateReviewRequest) => void
  isPending: boolean
}

export function ReviewForm({ onSubmit, isPending }: ReviewFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      content: '',
    },
  })

  const rating = form.watch('rating')
  const content = form.watch('content')

  const handleEmojiSelect = (emoji: string) => {
    const currentContent = content || ''
    const textarea = textareaRef.current

    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent =
        currentContent.substring(0, start) +
        emoji +
        currentContent.substring(end)

      form.setValue('content', newContent)

      setTimeout(() => {
        textarea.focus()
        const newPosition = start + emoji.length
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
    } else {
      form.setValue('content', currentContent + emoji)
    }
  }

  const handleSubmit = (data: ReviewFormData) => {
    onSubmit({
      ...data,
      title: data.title || null,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='p-6 space-y-8'
      >
        {/* Rating Section */}
        <FormField
          control={form.control}
          name='rating'
          render={({ field }) => (
            <FormItem>
              <div className='text-center space-y-4'>
                <FormLabel className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                  Đánh giá tổng quan
                </FormLabel>
                <FormControl>
                  <RatingStars
                    rating={field.value}
                    onRatingChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className='text-center' />
              </div>
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold'>
                Tiêu đề đánh giá
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='VD: Sản phẩm tuyệt vời, đáng mua!'
                  className='h-12 text-base'
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content with Emoji Picker */}
        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center justify-between mb-2'>
                <FormLabel className='text-base font-semibold'>
                  Đánh giá chi tiết
                </FormLabel>
                <EmojiButton onEmojiSelect={handleEmojiSelect} />
              </div>

              <FormControl>
                <Textarea
                  placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm này...'
                  rows={8}
                  className='resize-none text-base leading-relaxed'
                  {...field}
                  ref={(e) => {
                    field.ref(e)
                    if (e) textareaRef.current = e
                  }}
                />
              </FormControl>
              <div className='flex justify-between items-center'>
                <FormMessage />
                <span className='text-xs text-muted-foreground'>
                  {field.value?.length || 0} / 2000
                </span>
              </div>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className='pt-4 border-t'>
          <Button
            type='submit'
            disabled={isPending}
            className='w-full h-12 text-base font-semibold'
          >
            {isPending ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
