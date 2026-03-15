import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function Markdown({ content }: { content: string }) {
  return (
    <div
      className='prose prose-sm dark:prose-invert max-w-none w-full wrap-break-word
        [&>p]:wrap-break-word [&>p]:whitespace-pre-wrap[&>p]:mb-2 [&>p:last-child]:mb-0 
        [&>ul]:ml-4 [&>ul]:list-disc [&>ul]:space-y-0.5[&>ol]:ml-4 [&>ol]:list-decimal [&>ol]:space-y-0.5
        [&>strong]:font-semibold'
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
