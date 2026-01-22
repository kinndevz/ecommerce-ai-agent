import type { Artifact, ProductData } from '@/api/chat.api'
import type { CartData } from '@/api/cart.api'
import type { OrderDetail, OrderListItem } from '@/api/order.api'

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
        artifact.tool_name === 'search_product_new_arrival'
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
