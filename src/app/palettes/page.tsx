'use client'

import type { JSX } from 'react'
import { usePalettesPage } from '@/features/palettes/hooks/usePalettesPage'
import { PalettesToolbar } from '@/features/palettes/components/PalettesToolbar'
import { PaletteGrid } from '@/features/palettes/components/PaletteGrid'
import { AddPaletteModal } from '@/features/palettes/components/AddPaletteModal'
import { EditPaletteModal } from '@/features/palettes/components/EditPaletteModal'
import { PaletteViewModal } from '@/features/palettes/components/PaletteViewModal'
import { useAppStore } from '@/store'
import type { ColorPalette } from '@/types'

export default function PalettesPage(): JSX.Element {
  const {
    palettes,
    totalCount,
    groups,
    tags,
    filter,
    viewMode,
    setFilter,
    resetFilter,
    setViewMode,
    deletePalette,
    openModal,
  } = usePalettesPage()

  const allGroups = useAppStore((store) => store.groups)
  const modal = useAppStore((store) => store.modal)
  const closeModal = useAppStore((store) => store.closeModal)

  const viewedPalette = modal?.type === 'viewPalette' ? (modal.payload as ColorPalette) : null
  const viewedPaletteGroup = allGroups.find((g) => g.id === viewedPalette?.groupId)

  return (
    <div className="flex h-full flex-col">
      <PalettesToolbar
        totalCount={totalCount}
        filteredCount={palettes.length}
        filter={filter}
        viewMode={viewMode}
        groups={groups}
        tags={tags}
        onFilterChange={setFilter}
        onResetFilter={resetFilter}
        onViewModeChange={setViewMode}
        onAddPalette={() => openModal({ type: 'addPalette' })}
      />
      <div className="flex-1 overflow-auto">
        <PaletteGrid
          palettes={palettes}
          groups={groups}
          tags={tags}
          viewMode={viewMode}
          onDeletePalette={deletePalette}
          onEditPalette={(palette) => openModal({ type: 'editPalette', payload: palette })}
          onViewPalette={(palette) => openModal({ type: 'viewPalette', payload: palette })}
        />
      </div>

      <AddPaletteModal
        open={modal?.type === 'addPalette'}
        onClose={closeModal}
      />

      <EditPaletteModal
        open={modal?.type === 'editPalette'}
        palette={modal?.type === 'editPalette' ? (modal.payload as ColorPalette) : null}
        onClose={closeModal}
      />

      <PaletteViewModal
        open={modal?.type === 'viewPalette'}
        palette={viewedPalette}
        group={viewedPaletteGroup}
        tags={tags}
        onClose={closeModal}
        onEdit={(palette) => openModal({ type: 'editPalette', payload: palette })}
        onDelete={(id) => { deletePalette(id); closeModal() }}
      />
    </div>
  )
}
