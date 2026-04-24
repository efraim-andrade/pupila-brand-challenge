import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaletteViewModal } from '../PaletteViewModal'
import type { ColorPalette, Group, Tag } from '@/types'

beforeEach(() => jest.clearAllMocks())

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
})

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'g-1',
  name: 'Test Group',
  type: 'palette',
  ...overrides,
})

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 't-1',
  name: 'Test Tag',
  ...overrides,
})

const mockClipboard = {
  writeText: jest.fn(),
}

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: mockClipboard,
  })
})

describe('PaletteViewModal', () => {
  describe('open/closed state', () => {
    it('returns null when open is false', () => {
      const { container } = render(
        <PaletteViewModal
          open={false}
          palette={null}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('returns null when palette is null even if open is true', () => {
      const { container } = render(
        <PaletteViewModal
          open={true}
          palette={null}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('renders the modal when open and palette is provided', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByText('Test Palette')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })

  describe('palette details', () => {
    it('renders palette name', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette({ name: 'My Palette' })}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByText('My Palette')).toBeInTheDocument()
    })

    it('renders color count with singular', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette({ colors: [{ hex: '#fff' }] })}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByText('1 color')).toBeInTheDocument()
    })

    it('renders color count with plural', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByText('2 colors')).toBeInTheDocument()
    })

    it('renders group when provided', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette()}
          group={makeGroup({ name: 'My Group' })}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByText('My Group')).toBeInTheDocument()
    })

    it('renders tags when palette has tagIds', () => {
      const tag = makeTag({ id: 't-1', name: 'Tag One' })
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette({ tagIds: ['t-1'] })}
          group={undefined}
          tags={[tag]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByText('Tag One')).toBeInTheDocument()
    })

    it('renders comment count when comments exist', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette({ comments: [{ id: 'c-1', text: 'Comment', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }] })}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByText('1 comment')).toBeInTheDocument()
    })

    it('does not render comments section when no comments', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.queryByText(/comment/)).not.toBeInTheDocument()
    })
  })

  describe('color stripes', () => {
    it('renders color stripes for each color', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      const stripes = screen.getAllByTitle('Click to copy #ff0000')
      expect(stripes).toHaveLength(1)
    })

    it('renders empty state when no colors', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette({ colors: [] })}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByText('No colors in this palette')).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('renders Edit button', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByRole('button', { name: 'Edit palette' })).toBeInTheDocument()
    })

    it('renders Delete button', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByRole('button', { name: 'Delete palette' })).toBeInTheDocument()
    })

    it('renders Close button', () => {
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('calls onClose when Close button is clicked', async () => {
      const onClose = jest.fn()
      render(
        <PaletteViewModal
          open={true}
          palette={makePalette()}
          group={undefined}
          tags={[]}
          onClose={onClose}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      )

      await userEvent.click(screen.getByRole('button', { name: 'Close' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onEdit when Edit button is clicked', async () => {
      const onEdit = jest.fn()
      const palette = makePalette()
      render(
        <PaletteViewModal
          open={true}
          palette={palette}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={onEdit}
          onDelete={jest.fn()}
        />
      )

      await userEvent.click(screen.getByRole('button', { name: 'Edit palette' }))

      expect(onEdit).toHaveBeenCalledWith(palette)
    })

    it('calls onDelete when Delete button is clicked', async () => {
      const onDelete = jest.fn()
      const palette = makePalette()
      render(
        <PaletteViewModal
          open={true}
          palette={palette}
          group={undefined}
          tags={[]}
          onClose={jest.fn()}
          onEdit={jest.fn()}
          onDelete={onDelete}
        />
      )

      await userEvent.click(screen.getByRole('button', { name: 'Delete palette' }))

      expect(onDelete).toHaveBeenCalledWith('p-1')
    })
  })
})