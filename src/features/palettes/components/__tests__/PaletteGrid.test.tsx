import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColorPalette, Group, Tag, ViewMode } from '@/types';
import { PaletteGrid } from '../PaletteGrid';

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
  color: '#6366f1',
  ...overrides,
});

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 't-1',
  name: 'Tag One',
  color: '#ff0000',
  ...overrides,
});

const defaultProps = {
  palettes: [] as ColorPalette[],
  groups: [] as Group[],
  tags: [] as Tag[],
  viewMode: 'grid' as ViewMode,
  onDeletePalette: jest.fn(),
  onEditPalette: jest.fn(),
  onViewPalette: jest.fn(),
};

describe('PaletteGrid', () => {
  describe('empty state', () => {
    it('renders empty state when no palettes', () => {
      render(<PaletteGrid {...defaultProps} />);

      expect(screen.getByText('No palettes found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your filters or create a new palette')
      ).toBeInTheDocument();
    });
  });

  describe('grid view', () => {
    it('renders palette cards in grid layout', () => {
      render(<PaletteGrid {...defaultProps} palettes={[makePalette()]} />);

      expect(screen.getByText('Test Palette')).toBeInTheDocument();
    });

    it('renders multiple palette cards', () => {
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[
            makePalette({ id: 'p-1', name: 'Palette 1' }),
            makePalette({ id: 'p-2', name: 'Palette 2' }),
          ]}
        />
      );

      expect(screen.getByText('Palette 1')).toBeInTheDocument();
      expect(screen.getByText('Palette 2')).toBeInTheDocument();
    });
  });

  describe('list view', () => {
    it('renders palette rows in list layout', () => {
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[makePalette()]}
          viewMode="list"
        />
      );

      expect(screen.getByText('Test Palette')).toBeInTheDocument();
      expect(screen.getByText('2 colors')).toBeInTheDocument();
    });

    it('renders multiple palette rows', () => {
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[
            makePalette({ id: 'p-1', name: 'Palette 1' }),
            makePalette({ id: 'p-2', name: 'Palette 2' }),
          ]}
          viewMode="list"
        />
      );

      expect(screen.getByText('Palette 1')).toBeInTheDocument();
      expect(screen.getByText('Palette 2')).toBeInTheDocument();
    });
  });

  describe('group display', () => {
    it('shows group name when palette has groupId', () => {
      const group = makeGroup({ id: 'g-1', name: 'My Group' });
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[makePalette({ groupId: 'g-1' })]}
          groups={[group]}
        />
      );

      expect(screen.getByText('My Group')).toBeInTheDocument();
    });

    it('shows group name in list view', () => {
      const group = makeGroup({ id: 'g-1', name: 'My Group' });
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[makePalette({ groupId: 'g-1' })]}
          groups={[group]}
          viewMode="list"
        />
      );

      expect(screen.getByText('My Group')).toBeInTheDocument();
    });
  });

  describe('tag display', () => {
    it('shows tag badges when palette has tags', () => {
      const tag = makeTag({ id: 't-1', name: 'Tag One' });
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[makePalette({ tagIds: ['t-1'] })]}
          tags={[tag]}
        />
      );

      expect(screen.getByText('Tag One')).toBeInTheDocument();
    });
  });

  describe('comments display', () => {
    it('shows comment count in list view', () => {
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[
            makePalette({
              comments: [
                {
                  id: 'c-1',
                  text: 'Comment 1',
                  createdAt: '2024-01-01T00:00:00.000Z',
                  updatedAt: '2024-01-01T00:00:00.000Z',
                },
                {
                  id: 'c-2',
                  text: 'Comment 2',
                  createdAt: '2024-01-01T00:00:00.000Z',
                  updatedAt: '2024-01-01T00:00:00.000Z',
                },
              ],
            }),
          ]}
          viewMode="list"
        />
      );

      expect(screen.getByText(2)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onViewPalette when card is clicked in grid mode', async () => {
      const onViewPalette = jest.fn();
      const palette = makePalette();
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[palette]}
          onViewPalette={onViewPalette}
        />
      );

      await userEvent.click(screen.getByText('Test Palette'));

      expect(onViewPalette).toHaveBeenCalledWith(palette);
    });

    it('calls onViewPalette when row is clicked in list mode', async () => {
      const onViewPalette = jest.fn();
      const palette = makePalette();
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[palette]}
          onViewPalette={onViewPalette}
          viewMode="list"
        />
      );

      await userEvent.click(screen.getByText('Test Palette'));

      expect(onViewPalette).toHaveBeenCalledWith(palette);
    });

    it('calls onEditPalette when Edit button is clicked in grid mode', async () => {
      const onEditPalette = jest.fn();
      const palette = makePalette();
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[palette]}
          onEditPalette={onEditPalette}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Edit palette' })
      );

      expect(onEditPalette).toHaveBeenCalledWith(palette);
    });

    it('calls onDeletePalette when Delete button is clicked in grid mode', async () => {
      const onDeletePalette = jest.fn();
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[makePalette()]}
          onDeletePalette={onDeletePalette}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete palette' })
      );

      expect(onDeletePalette).toHaveBeenCalledWith('p-1');
    });

    it('calls onEditPalette when Edit button is clicked in list mode', async () => {
      const onEditPalette = jest.fn();
      const palette = makePalette();
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[palette]}
          onEditPalette={onEditPalette}
          viewMode="list"
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Edit palette' })
      );

      expect(onEditPalette).toHaveBeenCalledWith(palette);
    });

    it('calls onDeletePalette when Delete button is clicked in list mode', async () => {
      const onDeletePalette = jest.fn();
      render(
        <PaletteGrid
          {...defaultProps}
          palettes={[makePalette()]}
          onDeletePalette={onDeletePalette}
          viewMode="list"
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete palette' })
      );

      expect(onDeletePalette).toHaveBeenCalledWith('p-1');
    });
  });
});
