import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildCountLabel, Toolbar } from '../Toolbar';

beforeEach(() => jest.clearAllMocks());

const mockGroups = [
  { id: '1', name: 'Group A', type: 'palette' as const },
  { id: '2', name: 'Group B', type: 'palette' as const },
];

const mockTags = [
  { id: '1', name: 'Tag 1' },
  { id: '2', name: 'Tag 2' },
];

describe('buildCountLabel', () => {
  describe('palettes', () => {
    it('returns singular when count is 1 and matches total', () => {
      expect(buildCountLabel(1, 1, 'palettes')).toBe('1 palette');
    });

    it('returns plural when count is >1 and matches total', () => {
      expect(buildCountLabel(5, 5, 'palettes')).toBe('5 palettes');
    });

    it('returns filtered label when filtered count differs from total', () => {
      expect(buildCountLabel(3, 10, 'palettes')).toBe('3 of 10');
    });
  });

  describe('images', () => {
    it('returns singular when count is 1 and matches total', () => {
      expect(buildCountLabel(1, 1, 'images')).toBe('1 image');
    });

    it('returns plural when count is >1 and matches total', () => {
      expect(buildCountLabel(5, 5, 'images')).toBe('5 images');
    });

    it('returns filtered label when filtered count differs from total', () => {
      expect(buildCountLabel(3, 10, 'images')).toBe('3 of 10');
    });
  });
});

describe('Toolbar', () => {
  const defaultProps = {
    totalCount: 10,
    filteredCount: 10,
    filter: { search: '', groupId: null, tagIds: [] },
    viewMode: 'grid' as const,
    groups: mockGroups,
    tags: mockTags,
    onFilterChange: jest.fn(),
    onResetFilter: jest.fn(),
    onViewModeChange: jest.fn(),
    entityType: 'palettes' as const,
    onAdd: jest.fn(),
  };

  describe('rendering', () => {
    it('renders search input with placeholder', () => {
      render(<Toolbar {...defaultProps} />);

      expect(
        screen.getByPlaceholderText('Search palettes…')
      ).toBeInTheDocument();
    });

    it('renders Add button with label', () => {
      render(<Toolbar {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'New palette' })
      ).toBeInTheDocument();
    });

    it('renders count label', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getAllByText('10 palettes')[0]).toBeInTheDocument();
    });

    it('renders grid view button', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
    });

    it('renders list view button', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByLabelText('List view')).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('renders search input with current value', () => {
      render(
        <Toolbar
          {...defaultProps}
          filter={{ ...defaultProps.filter, search: 'test query' }}
        />
      );

      expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    });

    it('calls onFilterChange when search input changes', async () => {
      const onFilterChange = jest.fn();
      render(<Toolbar {...defaultProps} onFilterChange={onFilterChange} />);

      await userEvent.type(
        screen.getByPlaceholderText('Search palettes…'),
        'query'
      );

      expect(onFilterChange).toHaveBeenCalled();
    });
  });

  describe('groups', () => {
    it('renders group label when groups exist', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByText('Group:')).toBeInTheDocument();
    });

    it('renders group select with options', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('does not render groups section when groups array is empty', () => {
      render(<Toolbar {...defaultProps} groups={[]} />);

      expect(screen.queryByText('Group:')).not.toBeInTheDocument();
    });
  });

  describe('tags', () => {
    it('renders tag label when tags exist', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByText('Tags:')).toBeInTheDocument();
    });

    it('renders tag buttons', () => {
      render(<Toolbar {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Tag 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tag 2' })).toBeInTheDocument();
    });

    it('does not render tags section when tags array is empty', () => {
      render(<Toolbar {...defaultProps} tags={[]} />);

      expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
    });

    it('calls onFilterChange when tag is clicked', async () => {
      const onFilterChange = jest.fn();
      render(<Toolbar {...defaultProps} onFilterChange={onFilterChange} />);

      await userEvent.click(screen.getByRole('button', { name: 'Tag 1' }));

      expect(onFilterChange).toHaveBeenCalledWith({ tagIds: ['1'] });
    });

    it('toggles tag off when already active', async () => {
      const onFilterChange = jest.fn();
      render(
        <Toolbar
          {...defaultProps}
          onFilterChange={onFilterChange}
          filter={{ ...defaultProps.filter, tagIds: ['1'] }}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: 'Tag 1' }));

      expect(onFilterChange).toHaveBeenCalledWith({ tagIds: [] });
    });
  });

  describe('clear filter', () => {
    it('renders Clear button when filter is active (search)', () => {
      render(
        <Toolbar
          {...defaultProps}
          filter={{ ...defaultProps.filter, search: 'test' }}
        />
      );

      expect(
        screen.getAllByRole('button', { name: 'Clear' })[0]
      ).toBeInTheDocument();
    });

    it('renders Clear button when filter is active (group)', () => {
      render(
        <Toolbar
          {...defaultProps}
          filter={{ ...defaultProps.filter, groupId: '1' }}
        />
      );

      expect(
        screen.getAllByRole('button', { name: 'Clear' })[0]
      ).toBeInTheDocument();
    });

    it('renders Clear button when filter is active (tags)', () => {
      render(
        <Toolbar
          {...defaultProps}
          filter={{ ...defaultProps.filter, tagIds: ['1'] }}
        />
      );

      expect(
        screen.getAllByRole('button', { name: 'Clear' })[0]
      ).toBeInTheDocument();
    });

    it('does not render Clear button when no filter is active', () => {
      render(<Toolbar {...defaultProps} />);

      expect(
        screen.queryByRole('button', { name: 'Clear' })
      ).not.toBeInTheDocument();
    });

    it('calls onResetFilter when Clear button is clicked', async () => {
      const onResetFilter = jest.fn();
      render(
        <Toolbar
          {...defaultProps}
          onResetFilter={onResetFilter}
          filter={{ ...defaultProps.filter, search: 'test' }}
        />
      );

      await userEvent.click(
        screen.getAllByRole('button', { name: 'Clear' })[0]
      );

      expect(onResetFilter).toHaveBeenCalledTimes(1);
    });
  });

  describe('view mode', () => {
    it('applies active class to grid button when viewMode is grid', () => {
      render(<Toolbar {...defaultProps} viewMode="grid" />);

      const gridButton = screen.getByLabelText('Grid view');
      expect(gridButton).toHaveClass('bg-indigo-50', 'text-indigo-700');
    });

    it('applies active class to list button when viewMode is list', () => {
      render(<Toolbar {...defaultProps} viewMode="list" />);

      const listButton = screen.getByLabelText('List view');
      expect(listButton).toHaveClass('bg-indigo-50', 'text-indigo-700');
    });

    it('calls onViewModeChange when grid button is clicked', async () => {
      const onViewModeChange = jest.fn();
      render(
        <Toolbar
          {...defaultProps}
          viewMode="list"
          onViewModeChange={onViewModeChange}
        />
      );

      await userEvent.click(screen.getByLabelText('Grid view'));

      expect(onViewModeChange).toHaveBeenCalledWith('grid');
    });

    it('calls onViewModeChange when list button is clicked', async () => {
      const onViewModeChange = jest.fn();
      render(
        <Toolbar
          {...defaultProps}
          viewMode="grid"
          onViewModeChange={onViewModeChange}
        />
      );

      await userEvent.click(screen.getByLabelText('List view'));

      expect(onViewModeChange).toHaveBeenCalledWith('list');
    });
  });

  describe('add button', () => {
    it('calls onAdd when Add button is clicked', async () => {
      const onAdd = jest.fn();
      render(<Toolbar {...defaultProps} onAdd={onAdd} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'New palette' })
      );

      expect(onAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('images entity type', () => {
    it('shows "Search images…" placeholder for images', () => {
      render(<Toolbar {...defaultProps} entityType="images" />);

      expect(screen.getByPlaceholderText('Search images…')).toBeInTheDocument();
    });

    it('shows "Add image" label', () => {
      render(<Toolbar {...defaultProps} entityType="images" />);

      expect(
        screen.getByRole('button', { name: 'Add image' })
      ).toBeInTheDocument();
    });
  });
});
