export interface ProductData {
  id: string
  name: string
  slug: string
  tags: string[]
  price: number
  benefits: string[]
  concerns: string[]
  brand_name: string
  skin_types: string[]
  description: string
  is_available: boolean
  category_name: string
  product_image: string
  rating_average: number
  stock_quantity: number
}

export interface ProductMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface MCPData {
  data: ProductData[]
  meta: ProductMeta
  message: string
  success: boolean
}

export interface Artifact {
  success: boolean
  data_mcp: MCPData
  tool_name: string
  tool_call_id: string
}

export interface MessageMetadata {
  artifacts?: Artifact[]
  tool_calls?: number
  has_artifacts?: boolean
  [key: string]: any
}

export interface MessageResponse {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  artifacts?: Artifact[]
  message_metadata?: MessageMetadata
  created_at: string
}

export interface ChatMessageRequest {
  message: string
  conversation_id?: string
}

export interface ChatResponse {
  conversation_id: string
  thread_id: string
  message: MessageResponse
}

export interface ConversationSummary {
  id: string
  thread_id: string
  title: string
  created_at: string
  updated_at: string | null
  message_count: number
}

export interface ConversationDetail {
  id: string
  thread_id: string
  title: string
  messages: MessageResponse[]
  created_at: string
  updated_at: string | null
}

export interface ConversationsResponse {
  conversations: ConversationSummary[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
  meta?: Record<string, any> | null
}
