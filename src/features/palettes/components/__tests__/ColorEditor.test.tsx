import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import userEvent from '@testing-library/user-event'
import { ColorEditor, createColorItem, type ColorItem } from '../ColorEditor'

jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'test-id') }))

beforeEach(() => jest.clearAllMocks())

describe('ColorEditor', () => {
  describe('createColorItem', () => {
    it('creates item with default hex', () => {
      const item = createColorItem()

      expect(item).toHaveProperty('id', 'test-id')
      expect(item).toHaveProperty('hex', '#6366f1')
      expect(item).toHaveProperty('name', '')
    })

    it('creates item with custom hex', () => {
      const item = createColorItem('#ff0000')

      expect(item.hex).toBe('#ff0000')
    })

    it('returns item with id from nanoid', () => {
      const item = createColorItem()

      expect(item.id).toBe('test-id')
    })
  })

  describe('rendering', () => {
    it('renders empty state message when no items', () => {
      render(<ColorEditor items={[]} onChange={jest.fn()} />)

      expect(screen.getByText('No colors yet. Add one below.')).toBeInTheDocument()
    })

    it('renders add color button', () => {
      render(<ColorEditor items={[]} onChange={jest.fn()} />)

      expect(screen.getByRole('button', { name: 'Add color' })).toBeInTheDocument()
    })

    it('renders color items when provided', () => {
      const items: ColorItem[] = [
        { id: '1', hex: '#ff0000', name: 'Red' },
        { id: '2', hex: '#00ff00', name: 'Green' },
      ]

      render(<ColorEditor items={items} onChange={jest.fn()} />)

      const inputs = screen.getAllByPlaceholderText('#000000')
      expect(inputs).toHaveLength(2)
    })
  })

  describe('adding colors', () => {
    it('calls onChange with new item when add button clicked', async () => {
      const onChange = jest.fn()
      render(<ColorEditor items={[]} onChange={onChange} />)

      await userEvent.click(screen.getByRole('button', { name: 'Add color' }))

      expect(onChange).toHaveBeenCalledTimes(1)
      const newItems = onChange.mock.calls[0][0]
      expect(newItems).toHaveLength(1)
      expect(newItems[0]).toMatchObject({
        id: 'test-id',
        hex: '#6366f1',
        name: '',
      })
    })

    it('appends new color to existing items', async () => {
      const onChange = jest.fn()
      const items: ColorItem[] = [{ id: '1', hex: '#ff0000', name: 'Red' }]
      render(<ColorEditor items={items} onChange={onChange} />)

      await userEvent.click(screen.getByRole('button', { name: 'Add color' }))

      const newItems = onChange.mock.calls[0][0]
      expect(newItems).toHaveLength(2)
    })
  })

  describe('hex input', () => {
    it('calls onChange when hex text changes', async () => {
      const onChange = jest.fn()
      const items: ColorItem[] = [{ id: '1', hex: '#ff0000', name: '' }]
      render(<ColorEditor items={items} onChange={onChange} />)

      const hexInput = screen.getAllByPlaceholderText('#000000')[0]
      fireEvent.change(hexInput, { target: { value: '#00ff00' } })

      expect(onChange).toHaveBeenCalled()
    })

    it('adds # prefix if missing', async () => {
      const onChange = jest.fn()
      const items: ColorItem[] = [{ id: '1', hex: '#ff0000', name: '' }]
      render(<ColorEditor items={items} onChange={onChange} />)

      const hexInput = screen.getAllByPlaceholderText('#000000')[0]
      fireEvent.change(hexInput, { target: { value: '' } })
      fireEvent.change(hexInput, { target: { value: '00ff00' } })

      expect(onChange).toHaveBeenCalled()
    })

    it('limits hex to 7 characters', async () => {
      const onChange = jest.fn()
      const items: ColorItem[] = [{ id: '1', hex: '#ff0000', name: '' }]
      render(<ColorEditor items={items} onChange={onChange} />)

      const hexInput = screen.getAllByPlaceholderText('#000000')[0]
      fireEvent.change(hexInput, { target: { value: '#aabbccddee' } })

      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('name input', () => {
    it('calls onChange when name text changes', async () => {
      const onChange = jest.fn()
      const items: ColorItem[] = [{ id: '1', hex: '#ff0000', name: '' }]
      render(<ColorEditor items={items} onChange={onChange} />)

      const nameInput = screen.getByPlaceholderText('Color name (optional)')
      fireEvent.change(nameInput, { target: { value: 'M' } })

      expect(onChange).toHaveBeenCalled()
      const calledItems = onChange.mock.calls[0][0]
      expect(calledItems[0].name).toBe('M')
    })
  })

  describe('delete color', () => {
    it('calls onChange with item removed when delete clicked', async () => {
      const onChange = jest.fn()
      const items: ColorItem[] = [
        { id: '1', hex: '#ff0000', name: '' },
        { id: '2', hex: '#00ff00', name: '' },
      ]
      render(<ColorEditor items={items} onChange={onChange} />)

      const deleteButtons = screen.getAllByRole('button', { name: 'Remove color' })
      await userEvent.click(deleteButtons[0])

      expect(onChange).toHaveBeenCalled()
      const calledItems = onChange.mock.calls[0][0]
      expect(calledItems).toHaveLength(1)
      expect(calledItems[0].id).toBe('2')
    })
  })

  describe('color picker', () => {
    it('renders color input with correct value', () => {
      const items: ColorItem[] = [{ id: '1', hex: '#ff0000', name: '' }]
      render(<ColorEditor items={items} onChange={jest.fn()} />)

      const colorInputs = screen.getAllByLabelText('Pick color')
      expect(colorInputs[0]).toHaveValue('#ff0000')
    })

    it('calls onChange when color picker value changes', async () => {
      const onChange = jest.fn()
      const items: ColorItem[] = [{ id: '1', hex: '#ff0000', name: '' }]
      render(<ColorEditor items={items} onChange={onChange} />)

      const colorInputs = screen.getAllByLabelText('Pick color')
      fireEvent.change(colorInputs[0], { target: { value: '#00ff00' } })

      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('invalid hex handling', () => {
    it('shows error styling for invalid hex', () => {
      const items: ColorItem[] = [{ id: '1', hex: 'not-valid', name: '' }]
      render(<ColorEditor items={items} onChange={jest.fn()} />)

      const hexInput = screen.getAllByPlaceholderText('#000000')[0]
      expect(hexInput).toHaveClass('border-red-300', 'focus:border-red-500', 'focus:ring-red-500')
    })

    it('displays gray background for invalid hex', () => {
      const items: ColorItem[] = [{ id: '1', hex: 'invalid', name: '' }]
      render(<ColorEditor items={items} onChange={jest.fn()} />)

      const hexInput = screen.getAllByPlaceholderText('#000000')[0]
      expect(hexInput).toBeInTheDocument()
    })
  })

  describe('drag reordering', () => {
    it('does not call onChange when dropped on same item', async () => {
      const onChange = jest.fn()
      const items: ColorItem[] = [
        { id: '1', hex: '#ff0000', name: 'Red' },
        { id: '2', hex: '#00ff00', name: 'Green' },
      ]
      render(<ColorEditor items={items} onChange={onChange} />)

      const colorRows = screen.getAllByPlaceholderText('#000000')
      expect(colorRows[0]).toHaveValue('#ff0000')
    })

    it('renders when items exist', async () => {
      const onChange = jest.fn()
      const items: ColorItem[] = [
        { id: '1', hex: '#ff0000', name: 'Red' },
        { id: '2', hex: '#00ff00', name: 'Green' },
      ]
      render(<ColorEditor items={items} onChange={onChange} />)

      expect(screen.queryByText('No colors yet. Add one below.')).not.toBeInTheDocument()
    })
  })
})