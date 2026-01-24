import type { Category, CategoryTreeNode } from '@/api/category.api'

export interface CategorySelectOption {
  id: string
  name: string
  level: number
  childrenCount: number
}

export const generateCategorySlug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const buildCategoryTree = (
  items: Category[],
  parentId: string | null = null
): CategoryTreeNode[] =>
  items
    .filter((item) => item.parent_id === parentId)
    .sort((a, b) => a.display_order - b.display_order)
    .map((item) => ({
      ...item,
      children: buildCategoryTree(items, item.id),
    }))

export const flattenCategoryTree = (
  nodes: CategoryTreeNode[],
  level = 0,
  excludeId?: string
): CategorySelectOption[] => {
  const result: CategorySelectOption[] = []
  nodes.forEach((node) => {
    if (node.id !== excludeId) {
      result.push({
        id: node.id,
        name: node.name,
        level,
        childrenCount: node.children?.length ?? 0,
      })
      if (node.children?.length) {
        result.push(...flattenCategoryTree(node.children, level + 1, excludeId))
      }
    }
  })
  return result
}

export const findCategoryNode = (
  nodes: CategoryTreeNode[],
  id?: string | null
): CategoryTreeNode | null => {
  if (!id) return null
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findCategoryNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

export const getSuggestedDisplayOrder = (
  tree: CategoryTreeNode[],
  parentId?: string | null
) => {
  if (!parentId) {
    return tree.length
  }
  const parent = findCategoryNode(tree, parentId)
  return parent?.children?.length ?? 0
}
