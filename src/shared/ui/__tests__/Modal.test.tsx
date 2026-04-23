import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'

beforeEach(() => jest.clearAllMocks())

describe('Modal', () => {
  describe('open/closed state', () => {
    it('returns null when open is false', () => {
      const { container } = render(
        <Modal open={false} onClose={jest.fn()}>content</Modal>
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('renders the dialog when open is true', () => {
      render(
        <Modal open={true} onClose={jest.fn()}>content</Modal>
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('title', () => {
    it('renders the title in an h2 when provided', () => {
      render(
        <Modal open={true} onClose={jest.fn()} title="My Modal">content</Modal>
      )

      expect(screen.getByRole('heading', { level: 2, name: 'My Modal' })).toBeInTheDocument()
    })

    it('does not render an h2 when title is not provided', () => {
      render(
        <Modal open={true} onClose={jest.fn()}>content</Modal>
      )

      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
    })
  })

  describe('children', () => {
    it('renders children inside the dialog', () => {
      render(
        <Modal open={true} onClose={jest.fn()}>modal body text</Modal>
      )

      expect(screen.getByText('modal body text')).toBeInTheDocument()
    })
  })

  describe('onClose triggers', () => {
    it('calls onClose when the backdrop is clicked', async () => {
      const onClose = jest.fn()
      const { container } = render(
        <Modal open={true} onClose={onClose} title="T">content</Modal>
      )

      const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement
      await userEvent.click(backdrop)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the Close button is clicked', async () => {
      const onClose = jest.fn()
      render(
        <Modal open={true} onClose={onClose} title="T">content</Modal>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Close' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the Escape key is pressed', () => {
      const onClose = jest.fn()
      render(
        <Modal open={true} onClose={onClose}>content</Modal>
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does NOT call onClose when a non-Escape key is pressed', () => {
      const onClose = jest.fn()
      render(
        <Modal open={true} onClose={onClose}>content</Modal>
      )

      fireEvent.keyDown(document, { key: 'Enter' })

      expect(onClose).not.toHaveBeenCalled()
    })

    it('stops calling onClose on Escape after the modal is closed', () => {
      const onClose = jest.fn()
      const { rerender } = render(
        <Modal open={true} onClose={onClose}>content</Modal>
      )

      rerender(<Modal open={false} onClose={onClose}>content</Modal>)
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('size variants', () => {
    it('applies max-w-sm when size is "sm"', () => {
      render(<Modal open={true} onClose={jest.fn()} size="sm">content</Modal>)

      expect(screen.getByRole('dialog')).toHaveClass('max-w-sm')
    })

    it('applies max-w-md when size is "md"', () => {
      render(<Modal open={true} onClose={jest.fn()} size="md">content</Modal>)

      expect(screen.getByRole('dialog')).toHaveClass('max-w-md')
    })

    it('applies max-w-lg when size is "lg"', () => {
      render(<Modal open={true} onClose={jest.fn()} size="lg">content</Modal>)

      expect(screen.getByRole('dialog')).toHaveClass('max-w-lg')
    })

    it('applies max-w-2xl when size is "xl"', () => {
      render(<Modal open={true} onClose={jest.fn()} size="xl">content</Modal>)

      expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl')
    })

    it('defaults to max-w-md when size prop is omitted', () => {
      render(<Modal open={true} onClose={jest.fn()}>content</Modal>)

      expect(screen.getByRole('dialog')).toHaveClass('max-w-md')
    })
  })
})
