'use client';

import { type JSX, useCallback, useState } from 'react';
import { AddPaletteModal } from '@/features/palettes/components/AddPaletteModal';
import { EditPaletteModal } from '@/features/palettes/components/EditPaletteModal';
import { PaletteGrid } from '@/features/palettes/components/PaletteGrid';
import { PalettesToolbar } from '@/features/palettes/components/PalettesToolbar';
import { PaletteViewModal } from '@/features/palettes/components/PaletteViewModal';
import { usePalettesPage } from '@/features/palettes/hooks/usePalettesPage';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useAppStore } from '@/store';
import type { ColorPalette } from '@/types';

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
  } = usePalettesPage();

  const allGroups = useAppStore((store) => store.groups);
  const allPalettes = useAppStore((store) => store.palettes);
  const modal = useAppStore((store) => store.modal);
  const closeModal = useAppStore((store) => store.closeModal);
  const addPaletteComment = useAppStore((store) => store.addPaletteComment);
  const updatePaletteComment = useAppStore(
    (store) => store.updatePaletteComment
  );
  const deletePaletteComment = useAppStore(
    (store) => store.deletePaletteComment
  );

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const viewedPaletteId =
    modal?.type === 'viewPalette' ? (modal.payload as ColorPalette).id : null;
  const viewedPalette =
    allPalettes.find((p) => p.id === viewedPaletteId) ?? null;
  const viewedPaletteGroup = allGroups.find(
    (group) => group.id === viewedPalette?.groupId
  );

  const handleDeleteRequest = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDeleteId) return;
    deletePalette(pendingDeleteId);
    if (modal?.type === 'viewPalette') closeModal();
    setPendingDeleteId(null);
  }, [pendingDeleteId, deletePalette, modal, closeModal]);

  const handleDeleteCancel = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

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
          onDeletePalette={handleDeleteRequest}
          onEditPalette={(palette) =>
            openModal({ type: 'editPalette', payload: palette })
          }
          onViewPalette={(palette) =>
            openModal({ type: 'viewPalette', payload: palette })
          }
        />
      </div>

      <AddPaletteModal
        open={modal?.type === 'addPalette'}
        onClose={closeModal}
      />

      <EditPaletteModal
        open={modal?.type === 'editPalette'}
        palette={
          modal?.type === 'editPalette' ? (modal.payload as ColorPalette) : null
        }
        onClose={closeModal}
      />

      <PaletteViewModal
        open={modal?.type === 'viewPalette'}
        palette={viewedPalette}
        group={viewedPaletteGroup}
        tags={tags}
        onClose={closeModal}
        onEdit={(palette) =>
          openModal({ type: 'editPalette', payload: palette })
        }
        onDelete={handleDeleteRequest}
        onAddComment={(text) =>
          viewedPalette && addPaletteComment(viewedPalette.id, text)
        }
        onUpdateComment={(commentId, text) =>
          viewedPalette &&
          updatePaletteComment(viewedPalette.id, commentId, text)
        }
        onDeleteComment={(commentId) =>
          viewedPalette && deletePaletteComment(viewedPalette.id, commentId)
        }
      />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete palette"
        message="Are you sure you want to delete this palette? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
