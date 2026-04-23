import { isValidHex } from '@/lib/colorUtils'
import { createColorItem, type ColorItem } from '../components/ColorEditor'
import type { Color } from '@/types'

export function colorItemsToColors(items: ColorItem[]): Color[] {
  return items
    .filter((item) => isValidHex(item.hex))
    .map((item) => ({ hex: item.hex, ...(item.name ? { name: item.name } : {}) }))
}

export function paletteColorsToItems(colors: Color[]): ColorItem[] {
  return colors.map((color) => ({
    ...createColorItem(color.hex),
    name: color.name ?? '',
  }))
}

export function toggleTagId(tagIds: string[], tagId: string): string[] {
  return tagIds.includes(tagId)
    ? tagIds.filter((id) => id !== tagId)
    : [...tagIds, tagId]
}
