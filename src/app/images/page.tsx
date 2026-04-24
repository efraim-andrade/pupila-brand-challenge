'use client';

import { type JSX, useCallback } from 'react';
import { AddImageModal } from '@/features/images/components/AddImageModal';
import { CreatePaletteFromImageModal } from '@/features/images/components/CreatePaletteFromImageModal';
import { EditImageModal } from '@/features/images/components/EditImageModal';
import { ImageGrid } from '@/features/images/components/ImageGrid';
import { ImagesToolbar } from '@/features/images/components/ImagesToolbar';
import { useImagesPage } from '@/features/images/hooks/useImagesPage';
import { useAppStore } from '@/store';
import type { Image } from '@/types';

export default function ImagesPage(): JSX.Element {
  const {
    images,
    totalCount,
    groups,
    tags,
    filter,
    viewMode,
    setFilter,
    resetFilter,
    setViewMode,
    deleteImage,
    openModal,
  } = useImagesPage();

  const handleEditImage = useCallback(
    (image: Image) => openModal({ type: 'editImage', payload: image }),
    [openModal]
  );
  const handleCreatePalette = useCallback(
    (image: Image) =>
      openModal({ type: 'createPaletteFromImage', payload: image }),
    [openModal]
  );

  const modal = useAppStore((store) => store.modal);
  const closeModal = useAppStore((store) => store.closeModal);

  return (
    <div className="flex h-full flex-col">
      <ImagesToolbar
        totalCount={totalCount}
        filteredCount={images.length}
        filter={filter}
        viewMode={viewMode}
        groups={groups}
        tags={tags}
        onFilterChange={setFilter}
        onResetFilter={resetFilter}
        onViewModeChange={setViewMode}
        onAddImage={() => openModal({ type: 'addImage' })}
      />
      <div className="flex-1 overflow-auto">
        <ImageGrid
          images={images}
          groups={groups}
          tags={tags}
          viewMode={viewMode}
          onDeleteImage={deleteImage}
          onEditImage={handleEditImage}
          onCreatePalette={handleCreatePalette}
        />
      </div>

      <AddImageModal open={modal?.type === 'addImage'} onClose={closeModal} />

      <EditImageModal
        open={modal?.type === 'editImage'}
        image={modal?.type === 'editImage' ? (modal.payload as Image) : null}
        onClose={closeModal}
      />

      <CreatePaletteFromImageModal
        open={modal?.type === 'createPaletteFromImage'}
        image={
          modal?.type === 'createPaletteFromImage'
            ? (modal.payload as Image)
            : null
        }
        onClose={closeModal}
      />
    </div>
  );
}
