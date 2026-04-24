import { nanoid } from 'nanoid';
import type { ColorPalette, Group, Image, Tag } from '@/types';
import { TAG_COLORS } from './colors';

const now = new Date().toISOString();

export const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Brand Identity',
    type: 'shared',
    color: TAG_COLORS.indigo,
  },
  { id: 'g2', name: 'Campaign 2024', type: 'shared', color: TAG_COLORS.amber },
  { id: 'g3', name: 'Web Design', type: 'shared', color: TAG_COLORS.emerald },
];

export const mockTags: Tag[] = [
  { id: 't1', name: 'minimal', color: '#94a3b8' },
  { id: 't2', name: 'bold', color: TAG_COLORS.red },
  { id: 't3', name: 'nature', color: '#22c55e' },
  { id: 't4', name: 'corporate', color: TAG_COLORS.blue },
  { id: 't5', name: 'warm', color: TAG_COLORS.orange },
];

export const mockImages: Image[] = [
  {
    id: 'img1',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    name: 'Abstract Gradient',
    groupId: 'g1',
    tagIds: ['t1', 't3'],
    comments: [
      {
        id: nanoid(),
        text: 'Great for hero sections',
        createdAt: now,
        updatedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'img2',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    name: 'Minimalist Space',
    groupId: 'g2',
    tagIds: ['t1'],
    comments: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'img3',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
    name: 'Color Blend',
    groupId: 'g1',
    tagIds: ['t2', 't5'],
    comments: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'img4',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400',
    name: 'Pastel Flow',
    groupId: 'g3',
    tagIds: ['t1', 't4'],
    comments: [],
    createdAt: now,
    updatedAt: now,
  },
];

export const mockPalettes: ColorPalette[] = [
  {
    id: 'pal1',
    name: 'Ocean Depths',
    colors: [
      { hex: '#0f172a' },
      { hex: '#0e4f6e' },
      { hex: '#0891b2' },
      { hex: '#67e8f9' },
      { hex: '#f0f9ff' },
    ],
    groupId: 'g1',
    tagIds: ['t1', 't4'],
    comments: [
      {
        id: nanoid(),
        text: 'Perfect for SaaS product',
        createdAt: now,
        updatedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pal2',
    name: 'Sunset Warm',
    colors: [
      { hex: '#431407' },
      { hex: '#c2410c' },
      { hex: '#fb923c' },
      { hex: '#fcd34d' },
      { hex: '#fef9c3' },
    ],
    groupId: 'g2',
    tagIds: ['t5', 't2'],
    comments: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pal3',
    name: 'Forest Fresh',
    colors: [
      { hex: '#052e16' },
      { hex: '#15803d' },
      { hex: '#4ade80' },
      { hex: '#bbf7d0' },
      { hex: '#f0fdf4' },
    ],
    groupId: 'g3',
    tagIds: ['t3'],
    comments: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pal4',
    name: 'Neutral Studio',
    colors: [
      { hex: '#0c0a09' },
      { hex: '#44403c' },
      { hex: '#a8a29e' },
      { hex: '#d6d3d1' },
      { hex: '#fafaf9' },
    ],
    groupId: 'g1',
    tagIds: ['t1'],
    comments: [],
    createdAt: now,
    updatedAt: now,
  },
];
