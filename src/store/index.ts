'use client'

import { create } from 'zustand'
import { createImagesSlice, type ImagesSlice } from './imagesSlice'
import { createPalettesSlice, type PalettesSlice } from './palettesSlice'
import { createOrganizationSlice, type OrganizationSlice } from './organizationSlice'
import { createUISlice, type UISlice } from './uiSlice'

export type AppStore = ImagesSlice & PalettesSlice & OrganizationSlice & UISlice

export const useAppStore = create<AppStore>()((...storeArgs) => ({
  ...createImagesSlice(...storeArgs),
  ...createPalettesSlice(...storeArgs),
  ...createOrganizationSlice(...storeArgs),
  ...createUISlice(...storeArgs),
}))
