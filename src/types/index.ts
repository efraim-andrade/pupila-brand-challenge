export interface Color {
  hex: string;
  name?: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  type: 'image' | 'palette' | 'shared';
  color?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Image {
  id: string;
  url: string;
  name: string;
  groupId: string | null;
  tagIds: string[];
  comments: Comment[];
  extractedPaletteId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: Color[];
  groupId: string | null;
  tagIds: string[];
  comments: Comment[];
  sourceImageId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'grid' | 'list';

export interface FilterState {
  search: string;
  groupId: string | null;
  tagIds: string[];
}

export type ModalType =
  | 'addImage'
  | 'editImage'
  | 'addPalette'
  | 'editPalette'
  | 'viewPalette'
  | 'createPaletteFromImage'
  | 'configuration'
  | 'colorEditor'
  | 'exportImport';

export interface ModalState {
  type: ModalType;
  payload?: unknown;
}

export interface ExportData {
  version: 1;
  exportedAt: string;
  images: Image[];
  palettes: ColorPalette[];
  groups: Group[];
  tags: Tag[];
}
