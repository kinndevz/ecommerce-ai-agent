import type {
  Artifact,
  MessageResponse,
  PageContext,
  ProductData,
} from '@/api/chat.api'
import type { CartData } from '@/api/cart.api'
import type { OrderDetail, OrderListItem } from '@/api/order.api'
import type { Message } from '../components/chatbot/ChatMessage'

const getArtifactData = (artifact: Artifact): unknown =>
  artifact.data_mcp?.data as unknown

const isOrderListItem = (value: unknown): value is OrderListItem => {
  if (!value || typeof value !== 'object') return false
  const order = value as OrderListItem
  return Boolean(
    order.id &&
      order.order_number &&
      order.status &&
      order.payment_status &&
      typeof order.total === 'number' &&
      typeof order.total_items === 'number' &&
      order.created_at
  )
}

const isOrderDetail = (value: unknown): value is OrderDetail => {
  if (!value || typeof value !== 'object') return false
  const order = value as OrderDetail
  return Boolean(
    order.id &&
      order.order_number &&
      order.status &&
      order.payment_status &&
      order.total &&
      order.items &&
      order.shipping_address
  )
}

export const extractProducts = (artifacts?: Artifact[]): ProductData[] => {
  if (!artifacts || artifacts.length === 0) return []
  return artifacts
    .filter(
      (artifact) =>
        artifact.tool_name === 'search_products' ||
        artifact.tool_name === 'search_product_new_arrival' ||
        artifact.tool_name === 'get_related_products' ||
        artifact.tool_name === 'recommend_from_history'
    )
    .flatMap((artifact) => {
      const data = artifact.data_mcp?.data
      return Array.isArray(data) ? data : []
    })
}

export const extractCart = (artifacts?: Artifact[]): CartData | null => {
  if (!artifacts || artifacts.length === 0) return null

  const cartArtifact = artifacts.find(
    (artifact) => artifact.tool_name === 'view_cart'
  )

  if (!cartArtifact || !cartArtifact.data_mcp?.data) return null

  const data = cartArtifact.data_mcp.data
  return Array.isArray(data) ? null : (data as CartData)
}

export const extractOrders = (artifacts?: Artifact[]): OrderListItem[] => {
  if (!artifacts || artifacts.length === 0) return []
  return artifacts
    .filter((artifact) => artifact.tool_name === 'get_my_orders')
    .flatMap((artifact) => {
      const data = getArtifactData(artifact)
      return Array.isArray(data) ? data : []
    })
    .filter(isOrderListItem)
}

export const extractCreatedOrder = (
  artifacts?: Artifact[]
): OrderDetail | null => {
  if (!artifacts || artifacts.length === 0) return null
  const artifact = artifacts.find((item) => item.tool_name === 'create_order')
  if (!artifact) return null
  const data = getArtifactData(artifact)
  return isOrderDetail(data) ? data : null
}

export const extractOrderDetail = (
  artifacts?: Artifact[]
): OrderDetail | null => {
  if (!artifacts || artifacts.length === 0) return null
  const artifact = artifacts.find(
    (item) => item.tool_name === 'get_order_detail'
  )
  if (!artifact) return null
  const data = getArtifactData(artifact)
  return data as OrderDetail
}

export function buildPageContext(pathname: string): PageContext {
  if (pathname.startsWith('/products/'))
    return {
      type: 'product_detail',
      slug: pathname.replace('/products/', '').split('?')[0],
    }
  if (pathname === '/cart') return { type: 'cart' }
  if (pathname === '/orders') return { type: 'orders' }
  if (pathname.startsWith('/orders/'))
    return {
      type: 'order_detail',
      order_id: pathname.replace('/orders/', '').split('?')[0],
    }
  if (pathname === '/' || pathname === '/home') return { type: 'home' }

  return { type: 'other' }
}

export function toUiMessages(apiMessages: MessageResponse[]): Message[] {
  return apiMessages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    sender: msg.role === 'user' ? 'user' : 'ai',
    timestamp: new Date(msg.created_at),
    status: 'read' as const,
    artifacts: msg.artifacts || [],
  }))
}

export function isVisibleMessage(message: Message): boolean {
  return !(
    message.sender === 'ai' &&
    !message.content?.trim() &&
    (!message.artifacts || message.artifacts.length === 0)
  )
}

export function hasPendingAiMessage(messages?: MessageResponse[]): boolean {
  return (
    messages?.some(
      (msg) =>
        msg.role === 'assistant' &&
        msg.id?.startsWith('assistant-') &&
        !msg.content?.trim() &&
        (!msg.artifacts || msg.artifacts.length === 0)
    ) ?? false
  )
}
