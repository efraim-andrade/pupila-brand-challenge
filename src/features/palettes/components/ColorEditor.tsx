'use client'

import { type JSX, type ChangeEvent } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { isValidHex } from '@/lib/colorUtils'
import { nanoid } from 'nanoid'

export interface ColorItem {
  id: string
  hex: string
  name: string
}

export function createColorItem(hex = '#6366f1'): ColorItem {
  return { id: nanoid(), hex, name: '' }
}

interface SortableColorRowProps {
  item: ColorItem
  onHexChange: (id: string, hex: string) => void
  onNameChange: (id: string, name: string) => void
  onDelete: (id: string) => void
}

function SortableColorRow({
  item,
  onHexChange,
  onNameChange,
  onDelete,
}: SortableColorRowProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hexIsValid = isValidHex(item.hex)

  const handleHexTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    const normalized = raw.startsWith('#') ? raw : '#' + raw
    onHexChange(item.id, normalized.slice(0, 7))
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab rounded p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      </button>

      <div
        className="relative h-8 w-8 flex-shrink-0 cursor-pointer overflow-hidden rounded-full border border-gray-200 shadow-sm"
        style={{ backgroundColor: hexIsValid ? item.hex : '#e5e7eb' }}
        title="Pick color"
      >
        <input
          type="color"
          value={hexIsValid ? item.hex : '#000000'}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onHexChange(item.id, event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Pick color"
        />
      </div>

      <input
        type="text"
        value={item.hex}
        onChange={handleHexTextChange}
        placeholder="#000000"
        aria-label="Hex color code"
        className={`w-24 rounded-lg border px-2 py-1.5 font-mono text-xs text-gray-900 focus:outline-none focus:ring-1 ${
          hexIsValid
            ? 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
            : 'border-red-300 focus:border-red-500 focus:ring-red-500'
        }`}
      />

      <input
        type="text"
        value={item.name}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onNameChange(item.id, event.target.value)}
        placeholder="Color name (optional)"
        aria-label="Color name"
        className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Remove color"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface ColorEditorProps {
  items: ColorItem[]
  onChange: (items: ColorItem[]) => void
}

export function ColorEditor({ items, onChange }: ColorEditorProps): JSX.Element {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    onChange(arrayMove(items, oldIndex, newIndex))
  }

  const handleHexChange = (id: string, hex: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, hex } : item)))
  }

  const handleNameChange = (id: string, name: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, name } : item)))
  }

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableColorRow
              key={item.id}
              item={item}
              onHexChange={handleHexChange}
              onNameChange={handleNameChange}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <p className="text-xs text-gray-400">No colors yet. Add one below.</p>
      )}

      <button
        type="button"
        onClick={() => onChange([...items, createColorItem()])}
        className="flex items-center gap-1.5 self-start rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add color
      </button>
    </div>
  )
}
