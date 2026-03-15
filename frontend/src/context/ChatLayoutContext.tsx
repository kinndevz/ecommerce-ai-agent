import { createContext, useContext } from 'react'

type ChatLayoutType = 'full' | 'compact'

const ChatLayoutContext = createContext<ChatLayoutType>('full')

export const useChatLayout = () => useContext(ChatLayoutContext)

export const ChatLayoutProvider = ({
  layout,
  children,
}: {
  layout: ChatLayoutType
  children: React.ReactNode
}) => {
  return (
    <ChatLayoutContext.Provider value={layout}>
      {children}
    </ChatLayoutContext.Provider>
  )
}
