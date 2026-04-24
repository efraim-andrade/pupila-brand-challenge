'use client';

import { create } from 'zustand';
import { createImagesSlice, type ImagesSlice } from './imagesSlice';
import {
  createOrganizationSlice,
  type OrganizationSlice,
} from './organizationSlice';
import { createPalettesSlice, type PalettesSlice } from './palettesSlice';
import { createUISlice, type UISlice } from './uiSlice';

export type AppStore = ImagesSlice &
  PalettesSlice &
  OrganizationSlice &
  UISlice;

export const useAppStore = create<AppStore>()((...storeArgs) => ({
  ...createImagesSlice(...storeArgs),
  ...createPalettesSlice(...storeArgs),
  ...createOrganizationSlice(...storeArgs),
  ...createUISlice(...storeArgs),
}));
