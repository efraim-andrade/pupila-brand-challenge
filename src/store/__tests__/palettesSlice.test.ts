import { create } from 'zustand';
import { paletteDB } from '@/lib/db';
import type { ColorPalette } from '@/types';
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

const mockedPaletteDB = paletteDB as jest.Mocked<typeof paletteDB>;

const makeStore = () =>
  create<AppStore>()((...args) => ({
    ...createImagesSlice(...args),
    ...createPalettesSlice(...args),
    ...createOrganizationSlice(...args),
    ...createUISlice(...args),
  }));

const makePalette = (overrides: Partial<ColorPalette> = {}): ColorPalette => ({
  id: 'palette-1',
  name: 'Test Palette',
  colors: [],
  groupId: null,
  tagIds: [],
  comments: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('palettesSlice — initial state', () => {
  it('starts with an empty palettes array', () => {
    const store = makeStore();
    expect(store.getState().palettes).toEqual([]);
  });

  it('starts with palettesViewMode as grid', () => {
    const store = makeStore();
    expect(store.getState().palettesViewMode).toBe('grid');
  });

  it('starts with the default palettesFilter', () => {
    const store = makeStore();
    expect(store.getState().palettesFilter).toEqual({
      search: '',
      groupId: null,
      tagIds: [],
    });
  });
});

describe('hydratePalettes', () => {
  it('replaces the palettes array with the provided palettes', () => {
    const store = makeStore();
    const palettes = [makePalette({ id: 'p-1' }), makePalette({ id: 'p-2' })];

    store.getState().hydratePalettes(palettes);

    expect(store.getState().palettes).toEqual(palettes);
  });

  it('replaces existing palettes on subsequent calls', () => {
    const store = makeStore();
    store.getState().hydratePalettes([makePalette()]);
    store.getState().hydratePalettes([]);

    expect(store.getState().palettes).toEqual([]);
  });
});

describe('addPalette', () => {
  it('prepends the new palette to the front of the palettes array', () => {
    const store = makeStore();
    store.getState().hydratePalettes([makePalette({ id: 'existing' })]);

    store.getState().addPalette({
      name: 'New Palette',
      colors: [],
      groupId: null,
      tagIds: [],
      comments: [],
    });

    expect(store.getState().palettes[0].name).toBe('New Palette');
    expect(store.getState().palettes[1].id).toBe('existing');
  });

  it('assigns the id returned by nanoid', () => {
    const store = makeStore();
    store.getState().addPalette({
      name: 'X',
      colors: [],
      groupId: null,
      tagIds: [],
      comments: [],
    });

    expect(store.getState().palettes[0].id).toBe('test-id');
  });

  it('sets createdAt and updatedAt as ISO strings', () => {
    const store = makeStore();
    store.getState().addPalette({
      name: 'X',
      colors: [],
      groupId: null,
      tagIds: [],
      comments: [],
    });

    const { createdAt, updatedAt } = store.getState().palettes[0];
    expect(typeof createdAt).toBe('string');
    expect(typeof updatedAt).toBe('string');
  });

  it('calls paletteDB.put with the created palette', () => {
    const store = makeStore();
    store.getState().addPalette({
      name: 'Warm Tones',
      colors: [],
      groupId: null,
      tagIds: [],
      comments: [],
    });

    expect(mockedPaletteDB.put).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-id', name: 'Warm Tones' })
    );
  });
});

describe('updatePalette', () => {
  it('merges updates into the matching palette', () => {
    const store = makeStore();
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', name: 'Old Name' })]);

    store.getState().updatePalette('p-1', { name: 'New Name' });

    expect(store.getState().palettes[0].name).toBe('New Name');
  });

  it('refreshes updatedAt on the matching palette', () => {
    const store = makeStore();
    store
      .getState()
      .hydratePalettes([
        makePalette({ id: 'p-1', updatedAt: '2024-01-01T00:00:00.000Z' }),
      ]);

    store.getState().updatePalette('p-1', { name: 'Updated' });

    expect(typeof store.getState().palettes[0].updatedAt).toBe('string');
  });

  it('leaves non-matching palettes unchanged', () => {
    const store = makeStore();
    const paletteA = makePalette({ id: 'p-1', name: 'Alpha' });
    const paletteB = makePalette({ id: 'p-2', name: 'Beta' });
    store.getState().hydratePalettes([paletteA, paletteB]);

    store.getState().updatePalette('p-1', { name: 'Alpha Updated' });

    expect(store.getState().palettes[1]).toEqual(paletteB);
  });

  it('calls paletteDB.put with the updated palette', () => {
    const store = makeStore();
    store.getState().hydratePalettes([makePalette({ id: 'p-1', name: 'Old' })]);

    store.getState().updatePalette('p-1', { name: 'New' });

    expect(mockedPaletteDB.put).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p-1', name: 'New' })
    );
  });
});

describe('deletePalette', () => {
  it('removes the palette with the matching id', () => {
    const store = makeStore();
    store.getState().hydratePalettes([makePalette({ id: 'p-1' })]);

    store.getState().deletePalette('p-1');

    expect(store.getState().palettes).toHaveLength(0);
  });

  it('leaves non-matching palettes in the array', () => {
    const store = makeStore();
    const paletteA = makePalette({ id: 'p-1' });
    const paletteB = makePalette({ id: 'p-2' });
    store.getState().hydratePalettes([paletteA, paletteB]);

    store.getState().deletePalette('p-1');

    expect(store.getState().palettes).toEqual([paletteB]);
  });

  it('calls paletteDB.delete with the target id', () => {
    const store = makeStore();
    store.getState().hydratePalettes([makePalette({ id: 'p-1' })]);

    store.getState().deletePalette('p-1');

    expect(mockedPaletteDB.delete).toHaveBeenCalledWith('p-1');
  });
});

describe('addPaletteComment', () => {
  it('appends the comment to the matching palette', () => {
    const store = makeStore();
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [] })]);

    store.getState().addPaletteComment('p-1', 'Beautiful colors!');

    expect(store.getState().palettes[0].comments).toHaveLength(1);
  });

  it('assigns an id from nanoid to the new comment', () => {
    const store = makeStore();
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [] })]);

    store.getState().addPaletteComment('p-1', 'Nice!');

    expect(store.getState().palettes[0].comments[0].id).toBe('test-id');
  });

  it('stores the provided comment text', () => {
    const store = makeStore();
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [] })]);

    store.getState().addPaletteComment('p-1', 'Love this palette');

    expect(store.getState().palettes[0].comments[0].text).toBe(
      'Love this palette'
    );
  });

  it('sets comment createdAt and updatedAt as strings', () => {
    const store = makeStore();
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [] })]);

    store.getState().addPaletteComment('p-1', 'Hello');

    const { createdAt, updatedAt } = store.getState().palettes[0].comments[0];
    expect(typeof createdAt).toBe('string');
    expect(typeof updatedAt).toBe('string');
  });

  it('calls paletteDB.put with the updated palette', () => {
    const store = makeStore();
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [] })]);

    store.getState().addPaletteComment('p-1', 'Hello');

    expect(mockedPaletteDB.put).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p-1' })
    );
  });

  it('does not mutate non-matching palettes', () => {
    const store = makeStore();
    const paletteB = makePalette({ id: 'p-2', comments: [] });
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [] }), paletteB]);

    store.getState().addPaletteComment('p-1', 'Hello');

    expect(store.getState().palettes[1].comments).toHaveLength(0);
  });
});

describe('updatePaletteComment', () => {
  it('updates the text of the matching comment', () => {
    const store = makeStore();
    const comment = {
      id: 'c-1',
      text: 'Original',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [comment] })]);

    store.getState().updatePaletteComment('p-1', 'c-1', 'Updated text');

    expect(store.getState().palettes[0].comments[0].text).toBe('Updated text');
  });

  it('refreshes comment.updatedAt', () => {
    const store = makeStore();
    const comment = {
      id: 'c-1',
      text: 'Old',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [comment] })]);

    store.getState().updatePaletteComment('p-1', 'c-1', 'New');

    expect(typeof store.getState().palettes[0].comments[0].updatedAt).toBe(
      'string'
    );
  });

  it('refreshes palette.updatedAt', () => {
    const store = makeStore();
    const comment = {
      id: 'c-1',
      text: 'Old',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    store.getState().hydratePalettes([
      makePalette({
        id: 'p-1',
        updatedAt: '2024-01-01T00:00:00.000Z',
        comments: [comment],
      }),
    ]);

    store.getState().updatePaletteComment('p-1', 'c-1', 'New');

    expect(typeof store.getState().palettes[0].updatedAt).toBe('string');
  });

  it('calls paletteDB.put with the updated palette', () => {
    const store = makeStore();
    const comment = {
      id: 'c-1',
      text: 'Old',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [comment] })]);

    store.getState().updatePaletteComment('p-1', 'c-1', 'New');

    expect(mockedPaletteDB.put).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p-1' })
    );
  });
});

describe('deletePaletteComment', () => {
  it('removes the matching comment from the palette', () => {
    const store = makeStore();
    const comment = {
      id: 'c-1',
      text: 'Hello',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [comment] })]);

    store.getState().deletePaletteComment('p-1', 'c-1');

    expect(store.getState().palettes[0].comments).toHaveLength(0);
  });

  it('leaves non-matching comments in the array', () => {
    const store = makeStore();
    const commentA = {
      id: 'c-1',
      text: 'A',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    const commentB = {
      id: 'c-2',
      text: 'B',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    store
      .getState()
      .hydratePalettes([
        makePalette({ id: 'p-1', comments: [commentA, commentB] }),
      ]);

    store.getState().deletePaletteComment('p-1', 'c-1');

    expect(store.getState().palettes[0].comments).toEqual([commentB]);
  });

  it('refreshes palette.updatedAt', () => {
    const store = makeStore();
    const comment = {
      id: 'c-1',
      text: 'Hello',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    store.getState().hydratePalettes([
      makePalette({
        id: 'p-1',
        updatedAt: '2024-01-01T00:00:00.000Z',
        comments: [comment],
      }),
    ]);

    store.getState().deletePaletteComment('p-1', 'c-1');

    expect(typeof store.getState().palettes[0].updatedAt).toBe('string');
  });

  it('calls paletteDB.put with the updated palette', () => {
    const store = makeStore();
    const comment = {
      id: 'c-1',
      text: 'Hello',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    store
      .getState()
      .hydratePalettes([makePalette({ id: 'p-1', comments: [comment] })]);

    store.getState().deletePaletteComment('p-1', 'c-1');

    expect(mockedPaletteDB.put).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p-1' })
    );
  });
});

describe('setPalettesViewMode', () => {
  it('sets the view mode to list', () => {
    const store = makeStore();
    store.getState().setPalettesViewMode('list');
    expect(store.getState().palettesViewMode).toBe('list');
  });

  it('sets the view mode back to grid', () => {
    const store = makeStore();
    store.getState().setPalettesViewMode('list');
    store.getState().setPalettesViewMode('grid');
    expect(store.getState().palettesViewMode).toBe('grid');
  });
});

describe('setPalettesFilter', () => {
  it('updates the search field while preserving other filter fields', () => {
    const store = makeStore();
    store.getState().setPalettesFilter({ groupId: 'g-1' });
    store.getState().setPalettesFilter({ search: 'warm' });

    expect(store.getState().palettesFilter).toEqual({
      search: 'warm',
      groupId: 'g-1',
      tagIds: [],
    });
  });

  it('updates groupId while preserving search', () => {
    const store = makeStore();
    store.getState().setPalettesFilter({ search: 'cool tones' });
    store.getState().setPalettesFilter({ groupId: 'g-2' });

    expect(store.getState().palettesFilter.search).toBe('cool tones');
    expect(store.getState().palettesFilter.groupId).toBe('g-2');
  });

  it('updates tagIds without resetting search or groupId', () => {
    const store = makeStore();
    store.getState().setPalettesFilter({ search: 'dark', groupId: 'g-1' });
    store.getState().setPalettesFilter({ tagIds: ['t-1', 't-2'] });

    expect(store.getState().palettesFilter).toEqual({
      search: 'dark',
      groupId: 'g-1',
      tagIds: ['t-1', 't-2'],
    });
  });
});

describe('resetPalettesFilter', () => {
  it('resets the filter to the default values', () => {
    const store = makeStore();
    store
      .getState()
      .setPalettesFilter({ search: 'warm', groupId: 'g-1', tagIds: ['t-1'] });

    store.getState().resetPalettesFilter();

    expect(store.getState().palettesFilter).toEqual({
      search: '',
      groupId: null,
      tagIds: [],
    });
  });
});
