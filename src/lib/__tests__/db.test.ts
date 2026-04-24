import type { ColorPalette, Group, Image, Tag } from '@/types';

jest.mock('idb', () => ({ openDB: jest.fn() }));

// db.ts keeps a module-level dbInstance singleton. resetModules() clears it between tests
// so each test gets a fresh module with dbInstance = null and can configure its own openDB mock.
beforeEach(() => {
  jest.resetModules();
});

const makeImage = (overrides: Partial<Image> = {}): Image => ({
  id: 'img1',
  url: 'https://example.com/img.png',
  name: 'Test Image',
  groupId: null,
  tagIds: [],
  comments: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const makePalette = (overrides: Partial<ColorPalette> = {}): ColorPalette => ({
  id: 'pal1',
  name: 'Test Palette',
  colors: [{ hex: '#ff0000' }],
  groupId: null,
  tagIds: [],
  comments: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'g1',
  name: 'Brand',
  type: 'shared',
  ...overrides,
});

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 't1',
  name: 'minimal',
  ...overrides,
});

type StoreMap = Record<
  string,
  {
    getAll: jest.Mock;
    put: jest.Mock;
    delete: jest.Mock;
    clear: jest.Mock;
  }
>;

const makeStore = (items: unknown[] = []) => ({
  getAll: jest.fn().mockResolvedValue(items),
  put: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
});

const buildMockDB = (storeMap: StoreMap) => ({
  getAll: jest.fn((name: string) => storeMap[name].getAll()),
  put: jest.fn((name: string, item: unknown) => storeMap[name].put(item)),
  delete: jest.fn((name: string, id: string) => storeMap[name].delete(id)),
  transaction: jest.fn().mockReturnValue({
    objectStore: jest.fn((name: string) => storeMap[name]),
    done: Promise.resolve(),
  }),
});

describe('imageDB', () => {
  it('getAll retrieves all images', async () => {
    const { openDB } = require('idb');
    const images = [makeImage()];
    openDB.mockResolvedValue(buildMockDB({ images: makeStore(images) }));

    const { imageDB } = require('../db');
    await expect(imageDB.getAll()).resolves.toEqual(images);
  });

  it('put writes an image to the store', async () => {
    const { openDB } = require('idb');
    const image = makeImage();
    const storeMap = { images: makeStore() };
    const db = buildMockDB(storeMap);
    openDB.mockResolvedValue(db);

    const { imageDB } = require('../db');
    await imageDB.put(image);

    expect(db.put).toHaveBeenCalledWith('images', image);
  });

  it('delete removes an image by id', async () => {
    const { openDB } = require('idb');
    const storeMap = { images: makeStore() };
    const db = buildMockDB(storeMap);
    openDB.mockResolvedValue(db);

    const { imageDB } = require('../db');
    await imageDB.delete('img1');

    expect(db.delete).toHaveBeenCalledWith('images', 'img1');
  });
});

describe('paletteDB', () => {
  it('getAll retrieves all palettes', async () => {
    const { openDB } = require('idb');
    const palettes = [makePalette()];
    openDB.mockResolvedValue(buildMockDB({ palettes: makeStore(palettes) }));

    const { paletteDB } = require('../db');
    await expect(paletteDB.getAll()).resolves.toEqual(palettes);
  });

  it('put writes a palette to the store', async () => {
    const { openDB } = require('idb');
    const palette = makePalette();
    const db = buildMockDB({ palettes: makeStore() });
    openDB.mockResolvedValue(db);

    const { paletteDB } = require('../db');
    await paletteDB.put(palette);

    expect(db.put).toHaveBeenCalledWith('palettes', palette);
  });

  it('delete removes a palette by id', async () => {
    const { openDB } = require('idb');
    const db = buildMockDB({ palettes: makeStore() });
    openDB.mockResolvedValue(db);

    const { paletteDB } = require('../db');
    await paletteDB.delete('pal1');

    expect(db.delete).toHaveBeenCalledWith('palettes', 'pal1');
  });
});

describe('groupDB', () => {
  it('getAll retrieves all groups', async () => {
    const { openDB } = require('idb');
    const groups = [makeGroup()];
    openDB.mockResolvedValue(buildMockDB({ groups: makeStore(groups) }));

    const { groupDB } = require('../db');
    await expect(groupDB.getAll()).resolves.toEqual(groups);
  });

  it('put writes a group to the store', async () => {
    const { openDB } = require('idb');
    const group = makeGroup();
    const db = buildMockDB({ groups: makeStore() });
    openDB.mockResolvedValue(db);

    const { groupDB } = require('../db');
    await groupDB.put(group);

    expect(db.put).toHaveBeenCalledWith('groups', group);
  });

  it('delete removes a group by id', async () => {
    const { openDB } = require('idb');
    const db = buildMockDB({ groups: makeStore() });
    openDB.mockResolvedValue(db);

    const { groupDB } = require('../db');
    await groupDB.delete('g1');

    expect(db.delete).toHaveBeenCalledWith('groups', 'g1');
  });
});

describe('tagDB', () => {
  it('getAll retrieves all tags', async () => {
    const { openDB } = require('idb');
    const tags = [makeTag()];
    openDB.mockResolvedValue(buildMockDB({ tags: makeStore(tags) }));

    const { tagDB } = require('../db');
    await expect(tagDB.getAll()).resolves.toEqual(tags);
  });

  it('put writes a tag to the store', async () => {
    const { openDB } = require('idb');
    const tag = makeTag();
    const db = buildMockDB({ tags: makeStore() });
    openDB.mockResolvedValue(db);

    const { tagDB } = require('../db');
    await tagDB.put(tag);

    expect(db.put).toHaveBeenCalledWith('tags', tag);
  });

  it('delete removes a tag by id', async () => {
    const { openDB } = require('idb');
    const db = buildMockDB({ tags: makeStore() });
    openDB.mockResolvedValue(db);

    const { tagDB } = require('../db');
    await tagDB.delete('t1');

    expect(db.delete).toHaveBeenCalledWith('tags', 't1');
  });
});
