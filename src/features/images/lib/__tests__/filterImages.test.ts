import type { FilterState, Image } from '@/types';
import { filterImages } from '../filterImages';

const makeComment = (text: string) => ({
  id: 'c1',
  text,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const makeImage = (overrides: Partial<Image> = {}): Image => ({
  id: 'img1',
  url: 'https://example.com/image.jpg',
  name: 'Beach Sunset',
  groupId: null,
  tagIds: [],
  comments: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const noFilter: FilterState = { search: '', groupId: null, tagIds: [] };

describe('filterImages', () => {
  describe('with no active filters', () => {
    it('returns all images when filter is empty', () => {
      const images = [makeImage({ id: 'i1' }), makeImage({ id: 'i2' })];
      expect(filterImages(images, noFilter, {})).toEqual(images);
    });

    it('returns an empty array when there are no images', () => {
      expect(filterImages([], noFilter, {})).toEqual([]);
    });
  });

  describe('groupId filter', () => {
    it('keeps only images whose groupId matches', () => {
      const images = [
        makeImage({ id: 'i1', groupId: 'g1' }),
        makeImage({ id: 'i2', groupId: 'g2' }),
        makeImage({ id: 'i3', groupId: 'g1' }),
      ];
      const filter: FilterState = { ...noFilter, groupId: 'g1' };
      const result = filterImages(images, filter, {});
      expect(result.map((i) => i.id)).toEqual(['i1', 'i3']);
    });

    it('excludes images with a null groupId when a groupId filter is active', () => {
      const images = [
        makeImage({ id: 'i1', groupId: null }),
        makeImage({ id: 'i2', groupId: 'g1' }),
      ];
      const filter: FilterState = { ...noFilter, groupId: 'g1' };
      const result = filterImages(images, filter, {});
      expect(result.map((i) => i.id)).toEqual(['i2']);
    });

    it('returns all images when groupId filter is null', () => {
      const images = [
        makeImage({ id: 'i1', groupId: 'g1' }),
        makeImage({ id: 'i2', groupId: null }),
      ];
      expect(filterImages(images, noFilter, {}).length).toBe(2);
    });
  });

  describe('tagIds filter', () => {
    it('keeps images that include at least one of the selected tag ids', () => {
      const images = [
        makeImage({ id: 'i1', tagIds: ['t1', 't2'] }),
        makeImage({ id: 'i2', tagIds: ['t3'] }),
        makeImage({ id: 'i3', tagIds: ['t2', 't4'] }),
      ];
      const filter: FilterState = { ...noFilter, tagIds: ['t2'] };
      const result = filterImages(images, filter, {});
      expect(result.map((i) => i.id)).toEqual(['i1', 'i3']);
    });

    it('keeps an image that matches any of multiple selected tag ids', () => {
      const images = [
        makeImage({ id: 'i1', tagIds: ['t1'] }),
        makeImage({ id: 'i2', tagIds: ['t2'] }),
        makeImage({ id: 'i3', tagIds: ['t3'] }),
      ];
      const filter: FilterState = { ...noFilter, tagIds: ['t1', 't2'] };
      const result = filterImages(images, filter, {});
      expect(result.map((i) => i.id)).toEqual(['i1', 'i2']);
    });

    it('excludes images with no matching tag ids', () => {
      const images = [makeImage({ id: 'i1', tagIds: ['t3'] })];
      const filter: FilterState = { ...noFilter, tagIds: ['t1', 't2'] };
      expect(filterImages(images, filter, {})).toEqual([]);
    });

    it('does not filter by tags when tagIds is empty', () => {
      const images = [
        makeImage({ id: 'i1', tagIds: [] }),
        makeImage({ id: 'i2', tagIds: ['t1'] }),
      ];
      expect(filterImages(images, noFilter, {}).length).toBe(2);
    });
  });

  describe('search filter', () => {
    it('matches images whose name contains the query (case-insensitive)', () => {
      const images = [
        makeImage({ id: 'i1', name: 'Beach Sunset' }),
        makeImage({ id: 'i2', name: 'Mountain Peak' }),
      ];
      const filter: FilterState = { ...noFilter, search: 'beach' };
      const result = filterImages(images, filter, {});
      expect(result.map((i) => i.id)).toEqual(['i1']);
    });

    it('matches images whose tag name contains the query', () => {
      const images = [
        makeImage({ id: 'i1', name: 'Photo', tagIds: ['t1'] }),
        makeImage({ id: 'i2', name: 'Photo', tagIds: ['t2'] }),
      ];
      const tagNamesById = { t1: 'vacation', t2: 'nature' };
      const filter: FilterState = { ...noFilter, search: 'vac' };
      const result = filterImages(images, filter, tagNamesById);
      expect(result.map((i) => i.id)).toEqual(['i1']);
    });

    it('matches images whose comment text contains the query', () => {
      const images = [
        makeImage({
          id: 'i1',
          name: 'Alpha',
          comments: [makeComment('Best sunset ever')],
        }),
        makeImage({
          id: 'i2',
          name: 'Beta',
          comments: [makeComment('Great mountain view')],
        }),
      ];
      const filter: FilterState = { ...noFilter, search: 'sunset' };
      const result = filterImages(images, filter, {});
      expect(result.map((i) => i.id)).toEqual(['i1']);
    });

    it('excludes images that match none of name, tag, or comment', () => {
      const images = [
        makeImage({ id: 'i1', name: 'Beach', tagIds: ['t1'], comments: [] }),
      ];
      const tagNamesById = { t1: 'summer' };
      const filter: FilterState = { ...noFilter, search: 'nomatch' };
      expect(filterImages(images, filter, tagNamesById)).toEqual([]);
    });

    it('returns all images when search is an empty string', () => {
      const images = [makeImage({ id: 'i1' }), makeImage({ id: 'i2' })];
      expect(filterImages(images, { ...noFilter, search: '' }, {}).length).toBe(
        2
      );
    });
  });

  describe('combined filters', () => {
    it('applies groupId and search together (AND logic)', () => {
      const images = [
        makeImage({ id: 'i1', name: 'Beach', groupId: 'g1' }),
        makeImage({ id: 'i2', name: 'Beach', groupId: 'g2' }),
        makeImage({ id: 'i3', name: 'Mountain', groupId: 'g1' }),
      ];
      const filter: FilterState = {
        search: 'beach',
        groupId: 'g1',
        tagIds: [],
      };
      const result = filterImages(images, filter, {});
      expect(result.map((i) => i.id)).toEqual(['i1']);
    });

    it('applies tagIds and search together (AND logic)', () => {
      const images = [
        makeImage({ id: 'i1', name: 'Beach', tagIds: ['t1'] }),
        makeImage({ id: 'i2', name: 'Mountain', tagIds: ['t1'] }),
        makeImage({ id: 'i3', name: 'Beach', tagIds: ['t2'] }),
      ];
      const filter: FilterState = {
        search: 'beach',
        groupId: null,
        tagIds: ['t1'],
      };
      const result = filterImages(images, filter, {});
      expect(result.map((i) => i.id)).toEqual(['i1']);
    });
  });
});
