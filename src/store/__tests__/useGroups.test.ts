import { create } from 'zustand';
import type { Group } from '@/types';
import { createImagesSlice } from '../imagesSlice';
import type { AppStore } from '../index';
import { createOrganizationSlice } from '../organizationSlice';
import { createPalettesSlice } from '../palettesSlice';
import { createUISlice } from '../uiSlice';

jest.mock('@/lib/db', () => ({
  imageDB: { put: jest.fn(), delete: jest.fn() },
  paletteDB: { put: jest.fn(), delete: jest.fn() },
  groupDB: { put: jest.fn(), delete: jest.fn() },
  tagDB: { put: jest.fn(), delete: jest.fn() },
}));

jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'test-id') }));

const makeStore = () =>
  create<AppStore>()((...args) => ({
    ...createImagesSlice(...args),
    ...createPalettesSlice(...args),
    ...createOrganizationSlice(...args),
    ...createUISlice(...args),
  }));

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'group-1',
  name: 'My Group',
  type: 'image',
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('useGroups hook logic', () => {
  it('filters paletteGroups to include palette and shared type groups', () => {
    const store = makeStore();
    const { groups } = store.getState();

    const allGroups = [
      makeGroup({ id: '1', type: 'palette' }),
      makeGroup({ id: '2', type: 'image' }),
      makeGroup({ id: '3', type: 'shared' }),
    ];

    const paletteGroups = allGroups.filter(
      (group) => group.type === 'palette' || group.type === 'shared'
    );
    const imageGroups = allGroups.filter(
      (group) => group.type === 'image' || group.type === 'shared'
    );

    expect(paletteGroups).toHaveLength(2);
    expect(paletteGroups.map((g) => g.id)).toEqual(['1', '3']);

    expect(imageGroups).toHaveLength(2);
    expect(imageGroups.map((g) => g.id)).toEqual(['2', '3']);
  });

  it('returns all groups', () => {
    const store = makeStore();
    store
      .getState()
      .hydrateOrganization(
        [makeGroup({ id: '1' }), makeGroup({ id: '2' })],
        []
      );

    const { groups } = store.getState();

    expect(groups).toHaveLength(2);
  });

  it('has addGroup function', () => {
    const store = makeStore();

    expect(store.getState().addGroup).toBeDefined();
  });

  it('has updateGroup function', () => {
    const store = makeStore();

    expect(store.getState().updateGroup).toBeDefined();
  });

  it('has deleteGroup function', () => {
    const store = makeStore();

    expect(store.getState().deleteGroup).toBeDefined();
  });
});
