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
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
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
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
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
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
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
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
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
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
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
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
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
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
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
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
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
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
        />
      );

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onViewPalette when card is clicked', async () => {
      const onViewPalette = jest.fn();
      const palette = makePalette();
      render(
        <PaletteCard
          palette={palette}
          group={undefined}
          tags={[]}
          onDeletePalette={jest.fn()}
          onEditPalette={jest.fn()}
          onViewPalette={onViewPalette}
        />
      );

      await userEvent.click(screen.getByText('Test Palette'));

      expect(onViewPalette).toHaveBeenCalledWith(palette);
    });

    it('calls onEditPalette when Edit button is clicked', async () => {
      const onEditPalette = jest.fn();
      const palette = makePalette();
      render(
        <PaletteCard
          palette={palette}
          group={undefined}
          tags={[]}
          onDeletePalette={jest.fn()}
          onEditPalette={onEditPalette}
          onViewPalette={jest.fn()}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Edit palette' })
      );

      expect(onEditPalette).toHaveBeenCalledWith(palette);
    });

    it('calls onDeletePalette when Delete button is clicked', async () => {
      const onDeletePalette = jest.fn();
      render(
        <PaletteCard
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onDeletePalette={onDeletePalette}
          onEditPalette={jest.fn()}
          onViewPalette={jest.fn()}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete palette' })
      );

      expect(onDeletePalette).toHaveBeenCalledWith('p-1');
    });

    it('stops propagation when Edit button is clicked', async () => {
      const onViewPalette = jest.fn();
      const onEditPalette = jest.fn();
      render(
        <PaletteCard
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onDeletePalette={jest.fn()}
          onEditPalette={onEditPalette}
          onViewPalette={onViewPalette}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Edit palette' })
      );

      expect(onViewPalette).not.toHaveBeenCalled();
    });

    it('stops propagation when Delete button is clicked', async () => {
      const onViewPalette = jest.fn();
      const onDeletePalette = jest.fn();
      render(
        <PaletteCard
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onDeletePalette={onDeletePalette}
          onEditPalette={jest.fn()}
          onViewPalette={onViewPalette}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete palette' })
      );

      expect(onViewPalette).not.toHaveBeenCalled();
    });
  });
});
