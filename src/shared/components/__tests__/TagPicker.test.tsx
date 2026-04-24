import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagPicker } from '../TagPicker'
import { useAppStore } from '@/store'
import type { Tag } from '@/types'

jest.mock('@/store', () => ({ useAppStore: jest.fn() }))

const mockedUseAppStore = jest.mocked(useAppStore)

beforeEach(() => {
  jest.clearAllMocks()
  mockedUseAppStore.mockImplementation(
    (selector) => selector({ addTag: mockAddTag } as unknown as Parameters<typeof selector>[0])
  )
})

const mockAddTag = jest.fn<Tag, [Omit<Tag, 'id'>]>()

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 't1',
  name: 'Nature',
  ...overrides,
})

const defaultProps = {
  tags: [],
  selectedTagIds: [],
  onToggle: jest.fn(),
}

describe('TagPicker', () => {
  describe('tag buttons', () => {
    it('renders a button for each tag', () => {
      const tags = [makeTag({ id: 't1', name: 'Nature' }), makeTag({ id: 't2', name: 'Abstract' })]

      render(<TagPicker {...defaultProps} tags={tags} />)

      expect(screen.getByRole('button', { name: 'Nature' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Abstract' })).toBeInTheDocument()
    })

    it('applies active classes to selected tags', () => {
      const tags = [makeTag({ id: 't1', name: 'Nature' })]

      render(<TagPicker {...defaultProps} tags={tags} selectedTagIds={['t1']} />)

      expect(screen.getByRole('button', { name: 'Nature' })).toHaveClass(
        'bg-indigo-100',
        'text-indigo-700'
      )
    })

    it('does not apply active classes to unselected tags', () => {
      const tags = [makeTag({ id: 't1', name: 'Nature' })]

      render(<TagPicker {...defaultProps} tags={tags} selectedTagIds={[]} />)

      expect(screen.getByRole('button', { name: 'Nature' })).not.toHaveClass(
        'bg-indigo-100',
        'text-indigo-700'
      )
    })

    it('calls onToggle with the tag id when a tag button is clicked', async () => {
      const onToggle = jest.fn()
      const tags = [makeTag({ id: 't1', name: 'Nature' })]

      render(<TagPicker {...defaultProps} tags={tags} onToggle={onToggle} />)
      await userEvent.click(screen.getByRole('button', { name: 'Nature' }))

      expect(onToggle).toHaveBeenCalledWith('t1')
    })
  })

  describe('creation form visibility', () => {
    it('shows the "+ New tag" button initially', () => {
      render(<TagPicker {...defaultProps} />)

      expect(screen.getByRole('button', { name: '+ New tag' })).toBeInTheDocument()
    })

    it('shows the text input when the "+ New tag" button is clicked', async () => {
      render(<TagPicker {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: '+ New tag' }))

      expect(screen.getByPlaceholderText('Tag name')).toBeInTheDocument()
    })

    it('hides the creation form when Escape is pressed in the input', async () => {
      render(<TagPicker {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: '+ New tag' }))
      await userEvent.keyboard('{Escape}')

      expect(screen.queryByPlaceholderText('Tag name')).not.toBeInTheDocument()
    })

    it('hides the form without calling addTag when the Cancel button is clicked', async () => {
      render(<TagPicker {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: '+ New tag' }))
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(mockAddTag).not.toHaveBeenCalled()
      expect(screen.queryByPlaceholderText('Tag name')).not.toBeInTheDocument()
    })
  })

  describe('confirm button state', () => {
    it('disables the confirm button when the input is empty', async () => {
      render(<TagPicker {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: '+ New tag' }))

      expect(screen.getByRole('button', { name: 'Create tag' })).toBeDisabled()
    })
  })

  describe('tag creation', () => {
    it('calls addTag and onToggle with created.id when the confirm button is clicked with a non-empty name', async () => {
      const onToggle = jest.fn()
      const createdTag: Tag = { id: 'new-tag-id', name: 'Wildlife', color: '#6366f1' }
      mockAddTag.mockReturnValue(createdTag)

      render(<TagPicker {...defaultProps} onToggle={onToggle} />)
      await userEvent.click(screen.getByRole('button', { name: '+ New tag' }))
      await userEvent.type(screen.getByPlaceholderText('Tag name'), 'Wildlife')
      await userEvent.click(screen.getByRole('button', { name: 'Create tag' }))

      expect(mockAddTag).toHaveBeenCalledWith({ name: 'Wildlife', color: '#6366f1' })
      expect(onToggle).toHaveBeenCalledWith('new-tag-id')
    })

    it('calls addTag and onToggle when Enter is pressed with a non-empty name', async () => {
      const onToggle = jest.fn()
      const createdTag: Tag = { id: 'new-tag-id', name: 'Urban', color: '#6366f1' }
      mockAddTag.mockReturnValue(createdTag)

      render(<TagPicker {...defaultProps} onToggle={onToggle} />)
      await userEvent.click(screen.getByRole('button', { name: '+ New tag' }))
      await userEvent.type(screen.getByPlaceholderText('Tag name'), 'Urban')
      await userEvent.keyboard('{Enter}')

      expect(mockAddTag).toHaveBeenCalledWith({ name: 'Urban', color: '#6366f1' })
      expect(onToggle).toHaveBeenCalledWith('new-tag-id')
    })

    it('hides the creation form after successful creation', async () => {
      const createdTag: Tag = { id: 'new-tag-id', name: 'Urban', color: '#6366f1' }
      mockAddTag.mockReturnValue(createdTag)

      render(<TagPicker {...defaultProps} />)
      await userEvent.click(screen.getByRole('button', { name: '+ New tag' }))
      await userEvent.type(screen.getByPlaceholderText('Tag name'), 'Urban')
      await userEvent.click(screen.getByRole('button', { name: 'Create tag' }))

      expect(screen.queryByPlaceholderText('Tag name')).not.toBeInTheDocument()
    })
  })

  describe('color swatches', () => {
    it('gives the scale-125 class to the swatch that was clicked', async () => {
      render(<TagPicker {...defaultProps} />)

      await userEvent.click(screen.getByRole('button', { name: '+ New tag' }))
      const blueSwatchButton = screen.getByRole('button', { name: 'Select color #3b82f6' })
      await userEvent.click(blueSwatchButton)

      expect(blueSwatchButton).toHaveClass('scale-125')
    })
  })
})
