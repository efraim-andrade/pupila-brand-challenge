import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge } from '../Badge';

beforeEach(() => jest.clearAllMocks());

describe('Badge', () => {
  describe('content rendering', () => {
    it('renders children text', () => {
      render(<Badge>design</Badge>);

      expect(screen.getByText('design')).toBeInTheDocument();
    });
  });

  describe('color prop', () => {
    it('applies backgroundColor derived from the color hex when color is provided', () => {
      render(<Badge color="#ff0000">label</Badge>);

      const badge = screen.getByText('label');
      expect(badge).toHaveStyle({ backgroundColor: '#ff000022' });
    });

    it('applies borderColor derived from the color hex when color is provided', () => {
      render(<Badge color="#ff0000">label</Badge>);

      const badge = screen.getByText('label');
      expect(badge).toHaveStyle({ borderColor: '#ff000044' });
    });

    it('sets the color CSS property to the exact hex value when color is provided', () => {
      render(<Badge color="#ff0000">label</Badge>);

      const badge = screen.getByText('label');
      expect(badge).toHaveStyle({ color: '#ff0000' });
    });

    it('applies default gray Tailwind classes when color is not provided', () => {
      render(<Badge>label</Badge>);

      const badge = screen.getByText('label');
      expect(badge).toHaveClass(
        'border-gray-200',
        'bg-gray-100',
        'text-gray-600'
      );
    });
  });

  describe('remove button', () => {
    it('renders a Remove button when onRemove is provided', () => {
      render(<Badge onRemove={jest.fn()}>label</Badge>);

      expect(
        screen.getByRole('button', { name: 'Remove' })
      ).toBeInTheDocument();
    });

    it('does not render a Remove button when onRemove is not provided', () => {
      render(<Badge>label</Badge>);

      expect(
        screen.queryByRole('button', { name: 'Remove' })
      ).not.toBeInTheDocument();
    });

    it('calls onRemove when the Remove button is clicked', async () => {
      const onRemove = jest.fn();
      render(<Badge onRemove={onRemove}>label</Badge>);

      await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('className prop', () => {
    it('forwards the className prop to the root span', () => {
      render(<Badge className="custom-class">label</Badge>);

      expect(screen.getByText('label')).toHaveClass('custom-class');
    });
  });
});
