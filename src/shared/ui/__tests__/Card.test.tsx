import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card } from '../Card'

beforeEach(() => jest.clearAllMocks())

describe('Card', () => {
  describe('children', () => {
    it('renders children content', () => {
      render(<Card>Card content</Card>)

      expect(screen.getByText('Card content')).toBeInTheDocument()
    })
  })

  describe('className prop', () => {
    it('forwards custom className to the card', () => {
      render(<Card className="custom-class">Content</Card>)

      const card = screen.getByText('Content')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('clickable card', () => {
    it('applies cursor-pointer class when onClick is provided', () => {
      render(<Card onClick={jest.fn()}>Clickable</Card>)

      const card = screen.getByText('Clickable')
      expect(card).toHaveClass('cursor-pointer')
    })

    it('sets role button when onClick is provided', () => {
      render(<Card onClick={jest.fn()}>Clickable</Card>)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('sets tabIndex to 0 when onClick is provided', () => {
      render(<Card onClick={jest.fn()}>Clickable</Card>)

      expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0')
    })

    it('calls onClick when card is clicked', async () => {
      const onClick = jest.fn()
      render(<Card onClick={onClick}>Clickable</Card>)

      await userEvent.click(screen.getByRole('button'))

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('does not apply role button when onClick is not provided', () => {
      render(<Card>Non-clickable</Card>)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('does not have tabIndex when onClick is not provided', () => {
      render(<Card>Non-clickable</Card>)

      const card = screen.getByText('Non-clickable')
      expect(card).not.toHaveAttribute('tabIndex')
    })
  })
})