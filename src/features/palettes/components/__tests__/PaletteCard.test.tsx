import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColorPalette, Group, Tag } from '@/types';
import { PaletteCard } from '../PaletteCard';

beforeEach(() => jest.clearAllMocks());

const makePalette = (overrides: Partial<ColorPalette> = {}): ColorPalette => ({
  id: 'p-1',
  name: 'Test Palette',
  colors: [
    { hex: '#ff0000', name: 'Red' },
    { hex: '#00ff00', name: 'Green' },
  ],
  groupId: null,
  tagIds: [],
  comments: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'g-1',
  name: 'Test Group',
  type: 'palette',
  ...overrides,
});

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 't-1',
  name: 'Test Tag',
  color: '#ff0000',
  ...overrides,
});

describe('PaletteCard', () => {
  describe('palette name and info', () => {
    it('renders palette name', () => {
      render(
        <PaletteCard
          palette={makePalette({ name: 'My Palette' })}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      expect(screen.getByText('My Palette')).toBeInTheDocument();
    });

    it('renders color count with singular', () => {
      render(
        <PaletteCard
          palette={makePalette({ colors: [{ hex: '#fff' }] })}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      expect(screen.getByText('1 color')).toBeInTheDocument();
    });

    it('renders color count with plural', () => {
      render(
        <PaletteCard
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      expect(screen.getByText('2 colors')).toBeInTheDocument();
    });
  });

  describe('color display', () => {
    it('renders color stripes for each color', () => {
      render(
        <PaletteCard
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      expect(screen.getAllByRole('img')).toHaveLength(2);
    });

    it('renders "No colors" when palette is empty', () => {
      render(
        <PaletteCard
          palette={makePalette({ colors: [] })}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      expect(screen.getByText('No colors')).toBeInTheDocument();
    });
  });

  describe('group and tags', () => {
    it('renders group when provided', () => {
      render(
        <PaletteCard
          palette={makePalette()}
          group={makeGroup({ name: 'My Group' })}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      expect(screen.getByText('My Group')).toBeInTheDocument();
    });

    it('renders tags for palette tagIds', () => {
      const tag = makeTag({ id: 't-1', name: 'Tag One' });
      render(
        <PaletteCard
          palette={makePalette({ tagIds: ['t-1'] })}
          group={undefined}
          tags={[tag]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      expect(screen.getByText('Tag One')).toBeInTheDocument();
    });
  });

  describe('comments', () => {
    it('renders comment count when comments exist', () => {
      render(
        <PaletteCard
          palette={makePalette({
            comments: [
              {
                id: 'c-1',
                text: 'Comment',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
            ],
          })}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('does not render comments section when no comments', () => {
      render(
        <PaletteCard
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onView when card is clicked', async () => {
      const onView = jest.fn();
      const palette = makePalette();
      render(
        <PaletteCard
          palette={palette}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onView={onView}
        />
      );

      await userEvent.click(screen.getByText('Test Palette'));

      expect(onView).toHaveBeenCalledWith(palette);
    });

    it('calls onEdit when Edit button is clicked', async () => {
      const onEdit = jest.fn();
      const palette = makePalette();
      render(
        <PaletteCard
          palette={palette}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={onEdit}
          onView={jest.fn()}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Edit palette' })
      );

      expect(onEdit).toHaveBeenCalledWith(palette);
    });

    it('calls onDelete when Delete button is clicked', async () => {
      const onDelete = jest.fn();
      render(
        <PaletteCard
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onDelete={onDelete}
          onEdit={jest.fn()}
          onView={jest.fn()}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete palette' })
      );

      expect(onDelete).toHaveBeenCalledWith('p-1');
    });

    it('stops propagation when Edit button is clicked', async () => {
      const onView = jest.fn();
      const onEdit = jest.fn();
      render(
        <PaletteCard
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onDelete={jest.fn()}
          onEdit={onEdit}
          onView={onView}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Edit palette' })
      );

      expect(onView).not.toHaveBeenCalled();
    });

    it('stops propagation when Delete button is clicked', async () => {
      const onView = jest.fn();
      const onDelete = jest.fn();
      render(
        <PaletteCard
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onDelete={onDelete}
          onEdit={jest.fn()}
          onView={onView}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete palette' })
      );

      expect(onView).not.toHaveBeenCalled();
    });
  });
});
