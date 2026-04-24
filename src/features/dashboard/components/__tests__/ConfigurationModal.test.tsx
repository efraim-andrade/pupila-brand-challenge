import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigurationModal } from '../ConfigurationModal'
import type { Group, Tag, Image, ColorPalette } from '@/types'
import * as useAppStore from '@/store'

jest.mock('@/store')
jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'test-id') }))
jest.mock('@/lib/db', () => ({
  imageDB: { put: jest.fn(), delete: jest.fn() },
  paletteDB: { put: jest.fn(), delete: jest.fn() },
  groupDB: { put: jest.fn(), delete: jest.fn() },
  tagDB: { put: jest.fn(), delete: jest.fn() },
}))

beforeEach(() => jest.clearAllMocks())

const PRESET_COLORS = [
  '#6366f1',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
]

const mockGroups: Group[] = [
  { id: 'g-1', name: 'Group 1', type: 'shared' },
  { id: 'g-2', name: 'Group 2', type: 'palette' },
]

const mockTags: Tag[] = [
  { id: 't-1', name: 'Tag 1', color: '#ff0000' },
  { id: 't-2', name: 'Tag 2', color: '#00ff00' },
]

const mockImages: Image[] = []
const mockPalettes: ColorPalette[] = []

const setupStoreMock = (
  groups: Group[] = mockGroups,
  tags: Tag[] = mockTags,
  images: Image[] = mockImages,
  palettes: ColorPalette[] = mockPalettes
) => {
  const storeState = { groups, tags, images, palettes }
  ;(useAppStore.useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
    if (selector) return selector(storeState)
    return storeState
  })
}

describe('ConfigurationModal', () => {
  describe('open/closed state', () => {
    it('returns null when open is false', () => {
      setupStoreMock()
      const { container } = render(
        <ConfigurationModal open={false} onClose={jest.fn()} />
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('renders the modal when open is true', () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('title', () => {
    it('renders "Configuration" title', () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      expect(screen.getByRole('heading', { level: 2, name: 'Configuration' })).toBeInTheDocument()
    })
  })

  describe('tabs', () => {
    it('renders Groups and Tags tabs', () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      expect(screen.getByRole('button', { name: 'groups' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'tags' })).toBeInTheDocument()
    })

    it('renders groups by default', () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      expect(screen.getByText('Group 1')).toBeInTheDocument()
      expect(screen.getByText('Group 2')).toBeInTheDocument()
    })

    it('switches to Tags tab', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      await userEvent.click(screen.getByRole('button', { name: 'tags' }))

      expect(screen.getByText('Tag 1')).toBeInTheDocument()
      expect(screen.getByText('Tag 2')).toBeInTheDocument()
      expect(screen.queryByText('Group 1')).not.toBeInTheDocument()
    })

    it('shows empty state message when no items', () => {
      setupStoreMock([], [])
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      expect(screen.getByText('No groups yet. Create one below.')).toBeInTheDocument()
    })
  })

  describe('group items', () => {
    it('renders group name', () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      expect(screen.getByText('Group 1')).toBeInTheDocument()
    })

    it('renders group icon', () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      expect(screen.getByRole('button', { name: /Edit Group 1/i })).toBeInTheDocument()
    })
  })

  describe('tag items', () => {
    it('renders tag name', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      await userEvent.click(screen.getByRole('button', { name: 'tags' }))

      expect(screen.getByText('Tag 1')).toBeInTheDocument()
    })
  })

  describe('create new item', () => {
    it('renders "New group" button', () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      expect(screen.getByRole('button', { name: 'New group' })).toBeInTheDocument()
    })

    it('renders "New tag" button when on tags tab', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      await userEvent.click(screen.getByRole('button', { name: 'tags' }))

      expect(screen.getByRole('button', { name: 'New tag' })).toBeInTheDocument()
    })

    it('shows create form when "New group" is clicked', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      await userEvent.click(screen.getByRole('button', { name: 'New group' }))

      expect(screen.getByPlaceholderText('Group name')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(1)
    })

    it('shows tag creation form with color picker', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      await userEvent.click(screen.getByRole('button', { name: 'tags' }))
      await userEvent.click(screen.getByRole('button', { name: 'New tag' }))

      expect(screen.getByPlaceholderText('Tag name')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
      const colorButtons = screen.getAllByLabelText(/^Select color/)
      expect(colorButtons.length).toBe(PRESET_COLORS.length)
    })

    it('hides "New group" button when creating', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      await userEvent.click(screen.getByRole('button', { name: 'New group' }))

      expect(screen.queryByRole('button', { name: 'New group' })).not.toBeInTheDocument()
    })
  })

  describe('edit item', () => {
    it('shows edit button on hover', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      const groupItem = screen.getByText('Group 1').closest('li')
      await userEvent.hover(groupItem!)

      expect(screen.getByRole('button', { name: 'Edit Group 1' })).toBeInTheDocument()
    })

    it('shows edit form when Edit is clicked', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      const groupItem = screen.getByText('Group 1').closest('li')
      await userEvent.hover(groupItem!)
      await userEvent.click(screen.getByRole('button', { name: 'Edit Group 1' }))

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  describe('delete item', () => {
    it('shows delete confirmation when Delete is clicked', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      const groupItem = screen.getByText('Group 1').closest('li')
      await userEvent.hover(groupItem!)
      await userEvent.click(screen.getByRole('button', { name: 'Delete Group 1' }))

      expect(screen.getByText(/Delete.*Group 1/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(1)
    })

    it('cancels delete confirmation when Cancel is clicked', async () => {
      setupStoreMock()
      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      const groupItem = screen.getByText('Group 1').closest('li')
      await userEvent.hover(groupItem!)
      await userEvent.click(screen.getByRole('button', { name: 'Delete Group 1' }))
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.queryByText(/Delete "Group 1"/)).not.toBeInTheDocument()
      expect(screen.getByText('Group 1')).toBeInTheDocument()
    })
  })

  describe('usage count', () => {
    it('shows usage count when items are used', () => {
      const images: Image[] = [{ id: 'i-1', groupId: 'g-1', tagIds: [], name: 'Image', url: '', comments: [], createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }]
      const palettes: ColorPalette[] = [{ id: 'p-1', groupId: 'g-1', tagIds: [], name: 'Palette', colors: [], comments: [], createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }]
      setupStoreMock(mockGroups, [], images, palettes)

      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      expect(screen.getByText('2 items')).toBeInTheDocument()
    })

    it('shows warning when deleting used item', async () => {
      const images: Image[] = [{ id: 'i-1', groupId: 'g-1', tagIds: [], name: 'Image', url: '', comments: [], createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }]
      setupStoreMock(mockGroups, [], images, [])

      render(<ConfigurationModal open={true} onClose={jest.fn()} />)

      const groupItem = screen.getByText('Group 1').closest('li')
      await userEvent.hover(groupItem!)
      await userEvent.click(screen.getByRole('button', { name: 'Delete Group 1' }))

      expect(screen.getByText(/1 item will be ungrouped/)).toBeInTheDocument()
    })
  })
})