import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  PalettesToolbar,
  buildPaletteCountLabel,
  type FilterState,
  type ViewMode,
  type Group,
  type Tag,
} from '../PalettesToolbar'

beforeEach(() => jest.clearAllMocks())

describe('PalettesToolbar', () => {
  const defaultFilter: FilterState = {
    search: '',
    groupId: null,
    tagIds: [],
  }

  const groups: Group[] = [
    { id: 'g1', name: 'Group 1', imageIds: ['i1'] },
    { id: 'g2', name: 'Group 2', imageIds: ['i2'] },
  ]

  const tags: Tag[] = [
    { id: 't1', name: 'Tag One' },
    { id: 't2', name: 'Tag Two' },
  ]

  const defaultProps = {
    totalCount: 10,
    filteredCount: 10,
    filter: defaultFilter,
    viewMode: 'grid' as ViewMode,
    groups: [],
    tags: [],
    onFilterChange: jest.fn(),
    onResetFilter: jest.fn(),
    onViewModeChange: jest.fn(),
    onAddPalette: jest.fn(),
  }

  describe('rendering', () => {
    it('renders search input with placeholder', () => {
      render(<PalettesToolbar {...defaultProps} />)

      expect(screen.getByPlaceholderText('Search palettes…')).toBeInTheDocument()
    })

    it('renders grid and list view toggle buttons', () => {
      render(<PalettesToolbar {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Grid view' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'List view' })).toBeInTheDocument()
    })

    it('renders add palette button', () => {
      render(<PalettesToolbar {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'New palette' })).toBeInTheDocument()
    })

    it('renders groups select when groups are provided', () => {
      render(<PalettesToolbar {...defaultProps} groups={groups} />)

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('does not render group select when no groups are provided', () => {
      render(<PalettesToolbar {...defaultProps} groups={[]} />)

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })

    it('renders tag buttons when tags are provided', () => {
      render(<PalettesToolbar {...defaultProps} tags={tags} />)

      expect(screen.getByRole('button', { name: 'Tag One' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Tag Two' })).toBeInTheDocument()
    })
  })

  describe('count label', () => {
    it('shows "N palettes" when no filter is active', () => {
      render(<PalettesToolbar {...defaultProps} totalCount={5} filteredCount={5} />)

      expect(screen.getAllByText('5 palettes')[0]).toBeInTheDocument()
    })

    it('shows singular "palette" when count is 1', () => {
      render(<PalettesToolbar {...defaultProps} totalCount={1} filteredCount={1} />)

      expect(screen.getAllByText('1 palette')[0]).toBeInTheDocument()
    })

    it('shows "X of Y" when filter is active', () => {
      render(<PalettesToolbar {...defaultProps} totalCount={10} filteredCount={3} filter={{ ...defaultFilter, search: 'test' }} />)

      expect(screen.getAllByText('3 of 10')[0]).toBeInTheDocument()
    })
  })

  describe('search', () => {
    it('calls onFilterChange with search value when typing', async () => {
      const onFilterChange = jest.fn()
      render(<PalettesToolbar {...defaultProps} onFilterChange={onFilterChange} />)

      await userEvent.type(screen.getByPlaceholderText('Search palettes…'), 'abc')

      expect(onFilterChange).toHaveBeenCalled()
    })

    it('populates search input with existing filter value', () => {
      render(<PalettesToolbar {...defaultProps} filter={{ ...defaultFilter, search: 'existing' }} />)

      expect(screen.getByPlaceholderText('Search palettes…')).toHaveValue('existing')
    })
  })

  describe('view mode toggle', () => {
    it('calls onViewModeChange with grid when grid button clicked', async () => {
      const onViewModeChange = jest.fn()
      render(<PalettesToolbar {...defaultProps} viewMode="list" onViewModeChange={onViewModeChange} />)

      await userEvent.click(screen.getByRole('button', { name: 'Grid view' }))

      expect(onViewModeChange).toHaveBeenCalledWith('grid')
    })

    it('calls onViewModeChange with list when list button clicked', async () => {
      const onViewModeChange = jest.fn()
      render(<PalettesToolbar {...defaultProps} viewMode="grid" onViewModeChange={onViewModeChange} />)

      await userEvent.click(screen.getByRole('button', { name: 'List view' }))

      expect(onViewModeChange).toHaveBeenCalledWith('list')
    })

    it('applies active style to current view mode button', () => {
      render(<PalettesToolbar {...defaultProps} viewMode="grid" />)

      const gridButton = screen.getByRole('button', { name: 'Grid view' })
      expect(gridButton).toHaveClass('bg-indigo-50', 'text-indigo-700')
    })
  })

  describe('add palette button', () => {
    it('calls onAddPalette when clicked', async () => {
      const onAddPalette = jest.fn()
      render(<PalettesToolbar {...defaultProps} onAddPalette={onAddPalette} />)

      await userEvent.click(screen.getByRole('button', { name: 'New palette' }))

      expect(onAddPalette).toHaveBeenCalledTimes(1)
    })
  })

  describe('clear filter button', () => {
    it('shows clear button when filter is active', () => {
      render(<PalettesToolbar {...defaultProps} filter={{ ...defaultFilter, search: 'test' }} />)

      expect(screen.getAllByRole('button', { name: 'Clear' })[0]).toBeInTheDocument()
    })

    it('does not show clear button when no filter is active', () => {
      render(<PalettesToolbar {...defaultProps} filter={defaultFilter} />)

      expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
    })

    it('calls onResetFilter when clear button clicked', async () => {
      const onResetFilter = jest.fn()
      render(<PalettesToolbar {...defaultProps} filter={{ ...defaultFilter, search: 'test' }} onResetFilter={onResetFilter} />)

      await userEvent.click(screen.getAllByRole('button', { name: 'Clear' })[0])

      expect(onResetFilter).toHaveBeenCalledTimes(1)
    })
  })

  describe('groups select', () => {
    it('maps groups to options', () => {
      render(<PalettesToolbar {...defaultProps} groups={groups} />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('g1')
    })

    it('calls onFilterChange with groupId when group changes', async () => {
      const onFilterChange = jest.fn()
      render(<PalettesToolbar {...defaultProps} groups={groups} onFilterChange={onFilterChange} />)

      await userEvent.selectOptions(screen.getByRole('combobox'), 'g2')

      expect(onFilterChange).toHaveBeenCalledWith({ groupId: 'g2' })
    })

    it('pre-selects group from filter', () => {
      render(<PalettesToolbar {...defaultProps} groups={groups} filter={{ ...defaultFilter, groupId: 'g2' }} />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('g2')
    })
  })

  describe('tag filtering', () => {
    it('toggles tag when tag button clicked', async () => {
      const onFilterChange = jest.fn()
      render(<PalettesToolbar {...defaultProps} tags={tags} onFilterChange={onFilterChange} />)

      await userEvent.click(screen.getByRole('button', { name: 'Tag One' }))

      expect(onFilterChange).toHaveBeenCalledWith({ tagIds: ['t1'] })
    })

    it('removes tag when already active', async () => {
      const onFilterChange = jest.fn()
      render(<PalettesToolbar {...defaultProps} tags={tags} filter={{ ...defaultFilter, tagIds: ['t1'] }} onFilterChange={onFilterChange} />)

      await userEvent.click(screen.getByRole('button', { name: 'Tag One' }))

      expect(onFilterChange).toHaveBeenCalledWith({ tagIds: [] })
    })

    it('applies active style to selected tag', () => {
      render(<PalettesToolbar {...defaultProps} tags={tags} filter={{ ...defaultFilter, tagIds: ['t1'] }} />)

      const tagButton = screen.getByRole('button', { name: 'Tag One' })
      expect(tagButton).toHaveClass('bg-indigo-100', 'text-indigo-700')
    })
  })

  describe('buildPaletteCountLabel', () => {
    it('exports buildPaletteCountLabel function', () => {
      expect(typeof buildPaletteCountLabel).toBe('function')
    })

    it('returns formatted label', () => {
      expect(buildPaletteCountLabel(5, 10)).toBe('5 of 10')
    })

    it('handles zero total count', () => {
      expect(buildPaletteCountLabel(0, 0)).toBe('0 palettes')
    })

    it('handles single palette', () => {
      expect(buildPaletteCountLabel(1, 1)).toBe('1 palette')
    })
  })
})