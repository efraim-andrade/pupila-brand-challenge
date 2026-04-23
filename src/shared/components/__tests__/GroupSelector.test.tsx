import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GroupSelector } from '../GroupSelector'
import { useAppStore } from '@/store'
import type { Group } from '@/types'

jest.mock('@/store', () => ({ useAppStore: jest.fn() }))

const mockedUseAppStore = jest.mocked(useAppStore)

beforeEach(() => {
  jest.clearAllMocks()
  mockedUseAppStore.mockImplementation(
    (selector) => selector({ addGroup: mockAddGroup } as Parameters<typeof selector>[0])
  )
})

const mockAddGroup = jest.fn<Group, [Omit<Group, 'id'>]>()

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'g1',
  name: 'Design',
  type: 'shared',
  ...overrides,
})

const defaultProps = {
  groups: [],
  selectedGroupId: null,
  onSelect: jest.fn(),
}

describe('GroupSelector', () => {
  describe('select element', () => {
    it('renders a select with "No group" as the first option', () => {
      render(<GroupSelector {...defaultProps} />)

      const noGroupOption = screen.getByRole('option', { name: 'No group' })
      expect(noGroupOption).toBeInTheDocument()
    })

    it('renders each group as an option in the select', () => {
      const groups = [makeGroup({ id: 'g1', name: 'Brand' }), makeGroup({ id: 'g2', name: 'Icons' })]

      render(<GroupSelector {...defaultProps} groups={groups} />)

      expect(screen.getByRole('option', { name: 'Brand' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Icons' })).toBeInTheDocument()
    })

    it('reflects the selectedGroupId in the select value', () => {
      const groups = [makeGroup({ id: 'g1', name: 'Brand' })]

      render(<GroupSelector {...defaultProps} groups={groups} selectedGroupId="g1" />)

      expect(screen.getByRole('combobox')).toHaveValue('g1')
    })

    it('calls onSelect with the group id when a different group option is selected', async () => {
      const onSelect = jest.fn()
      const groups = [makeGroup({ id: 'g1', name: 'Brand' })]

      render(<GroupSelector {...defaultProps} groups={groups} onSelect={onSelect} />)

      await userEvent.selectOptions(screen.getByRole('combobox'), 'g1')

      expect(onSelect).toHaveBeenCalledWith('g1')
    })

    it('calls onSelect with null when the "No group" option is selected', async () => {
      const onSelect = jest.fn()
      const groups = [makeGroup({ id: 'g1', name: 'Brand' })]

      render(<GroupSelector {...defaultProps} groups={groups} selectedGroupId="g1" onSelect={onSelect} />)

      await userEvent.selectOptions(screen.getByRole('combobox'), '')

      expect(onSelect).toHaveBeenCalledWith(null)
    })
  })

  describe('creation form visibility', () => {
    it('shows the "+ New group" button initially', () => {
      render(<GroupSelector {...defaultProps} />)

      expect(screen.getByRole('button', { name: '+ New group' })).toBeInTheDocument()
    })

    it('shows the name input when the "+ New group" button is clicked', async () => {
      render(<GroupSelector {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: '+ New group' }))

      expect(screen.getByPlaceholderText('Group name')).toBeInTheDocument()
    })

    it('hides the creation form and shows "+ New group" again when Cancel is clicked', async () => {
      render(<GroupSelector {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: '+ New group' }))
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.queryByPlaceholderText('Group name')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '+ New group' })).toBeInTheDocument()
    })

    it('hides the creation form when Escape is pressed in the name input', async () => {
      render(<GroupSelector {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: '+ New group' }))
      await userEvent.keyboard('{Escape}')

      expect(screen.queryByPlaceholderText('Group name')).not.toBeInTheDocument()
    })
  })

  describe('Create button state', () => {
    it('disables the Create button when the name input is empty', async () => {
      render(<GroupSelector {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: '+ New group' }))

      expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    })
  })

  describe('group creation', () => {
    it('calls addGroup and onSelect when Enter is pressed in the name input with a non-empty name', async () => {
      const onSelect = jest.fn()
      const createdGroup: Group = { id: 'new-group-id', name: 'New Design', type: 'shared', color: '#6366f1' }
      mockAddGroup.mockReturnValue(createdGroup)

      render(<GroupSelector {...defaultProps} onSelect={onSelect} />)
      await userEvent.click(screen.getByRole('button', { name: '+ New group' }))
      await userEvent.type(screen.getByPlaceholderText('Group name'), 'New Design')
      await userEvent.keyboard('{Enter}')

      expect(mockAddGroup).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Design', type: 'shared' })
      )
      expect(onSelect).toHaveBeenCalledWith('new-group-id')
    })

    it('calls addGroup with name, type "shared", and color when Create is clicked', async () => {
      const createdGroup: Group = { id: 'new-group-id', name: 'Icons', type: 'shared', color: '#6366f1' }
      mockAddGroup.mockReturnValue(createdGroup)

      render(<GroupSelector {...defaultProps} />)
      await userEvent.click(screen.getByRole('button', { name: '+ New group' }))
      await userEvent.type(screen.getByPlaceholderText('Group name'), 'Icons')
      await userEvent.click(screen.getByRole('button', { name: 'Create' }))

      expect(mockAddGroup).toHaveBeenCalledWith({ name: 'Icons', type: 'shared', color: '#6366f1' })
    })

    it('calls onSelect with the created group id after clicking Create', async () => {
      const onSelect = jest.fn()
      const createdGroup: Group = { id: 'new-group-id', name: 'Icons', type: 'shared', color: '#6366f1' }
      mockAddGroup.mockReturnValue(createdGroup)

      render(<GroupSelector {...defaultProps} onSelect={onSelect} />)
      await userEvent.click(screen.getByRole('button', { name: '+ New group' }))
      await userEvent.type(screen.getByPlaceholderText('Group name'), 'Icons')
      await userEvent.click(screen.getByRole('button', { name: 'Create' }))

      expect(onSelect).toHaveBeenCalledWith('new-group-id')
    })

    it('hides the creation form after successful creation', async () => {
      const createdGroup: Group = { id: 'new-group-id', name: 'Icons', type: 'shared', color: '#6366f1' }
      mockAddGroup.mockReturnValue(createdGroup)

      render(<GroupSelector {...defaultProps} />)
      await userEvent.click(screen.getByRole('button', { name: '+ New group' }))
      await userEvent.type(screen.getByPlaceholderText('Group name'), 'Icons')
      await userEvent.click(screen.getByRole('button', { name: 'Create' }))

      expect(screen.queryByPlaceholderText('Group name')).not.toBeInTheDocument()
    })
  })
})
