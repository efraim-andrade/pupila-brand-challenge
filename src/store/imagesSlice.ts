import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import { imageDB } from '@/lib/db';
import type { FilterState, Image, ViewMode } from '@/types';
import type { AppStore } from './index';

export interface ImagesSlice {
  images: Image[];
  imagesViewMode: ViewMode;
  imagesFilter: FilterState;

  hydrateImages: (images: Image[]) => void;
  addImage: (fields: Omit<Image, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateImage: (
    id: string,
    updates: Partial<Omit<Image, 'id' | 'createdAt'>>
  ) => void;
  deleteImage: (id: string) => void;
  addImageComment: (imageId: string, text: string) => void;
  updateImageComment: (
    imageId: string,
    commentId: string,
    text: string
  ) => void;
  deleteImageComment: (imageId: string, commentId: string) => void;
  setImagesViewMode: (mode: ViewMode) => void;
  setImagesFilter: (filter: Partial<FilterState>) => void;
  resetImagesFilter: () => void;
}

const defaultFilter: FilterState = { search: '', groupId: null, tagIds: [] };

export const createImagesSlice: StateCreator<AppStore, [], [], ImagesSlice> = (
  set
) => ({
  images: [],
  imagesViewMode: 'grid',
  imagesFilter: defaultFilter,

  hydrateImages: (images) => set({ images }),

  addImage: (fields) => {
    const image: Image = {
      ...fields,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ images: [image, ...state.images] }));
    imageDB.put(image);
  },

  updateImage: (id, updates) => {
    set((state) => ({
      images: state.images.map((image) =>
        image.id === id
          ? { ...image, ...updates, updatedAt: new Date().toISOString() }
          : image
      ),
    }));
    set((state) => {
      const updatedImage = state.images.find((image) => image.id === id);
      if (updatedImage) imageDB.put(updatedImage);
      return {};
    });
  },

  deleteImage: (id) => {
    set((state) => ({
      images: state.images.filter((image) => image.id !== id),
    }));
    imageDB.delete(id);
  },

  addImageComment: (imageId, text) => {
    const comment = {
      id: nanoid(),
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      images: state.images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              comments: [...image.comments, comment],
              updatedAt: new Date().toISOString(),
            }
          : image
      ),
    }));
    set((state) => {
      const updatedImage = state.images.find((image) => image.id === imageId);
      if (updatedImage) imageDB.put(updatedImage);
      return {};
    });
  },

  updateImageComment: (imageId, commentId, text) => {
    set((state) => ({
      images: state.images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              comments: image.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, text, updatedAt: new Date().toISOString() }
                  : comment
              ),
              updatedAt: new Date().toISOString(),
            }
          : image
      ),
    }));
    set((state) => {
      const updatedImage = state.images.find((image) => image.id === imageId);
      if (updatedImage) imageDB.put(updatedImage);
      return {};
    });
  },

  deleteImageComment: (imageId, commentId) => {
    set((state) => ({
      images: state.images.map((image) =>
        image.id === imageId
          ? {
              ...image,
              comments: image.comments.filter(
                (comment) => comment.id !== commentId
              ),
              updatedAt: new Date().toISOString(),
            }
          : image
      ),
    }));
    set((state) => {
      const updatedImage = state.images.find((image) => image.id === imageId);
      if (updatedImage) imageDB.put(updatedImage);
      return {};
    });
  },

  setImagesViewMode: (mode) => set({ imagesViewMode: mode }),

  setImagesFilter: (filter) =>
    set((state) => ({ imagesFilter: { ...state.imagesFilter, ...filter } })),

  resetImagesFilter: () => set({ imagesFilter: defaultFilter }),
});
