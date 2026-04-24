import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

beforeEach(() => jest.clearAllMocks());

describe('Button', () => {
  describe('children', () => {
    it('renders children text', () => {
      render(<Button>Click me</Button>);

      expect(
        screen.getByRole('button', { name: 'Click me' })
      ).toBeInTheDocument();
    });
  });

  describe('variant prop', () => {
    it('applies primary variant classes by default', () => {
      render(<Button>Button</Button>);

      expect(screen.getByRole('button')).toHaveClass(
        'bg-indigo-600',
        'text-white'
      );
    });

    it('applies primary variant when explicitly set', () => {
      render(<Button variant="primary">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass(
        'bg-indigo-600',
        'text-white'
      );
    });

    it('applies secondary variant classes', () => {
      render(<Button variant="secondary">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass(
        'border',
        'border-gray-200',
        'text-gray-600'
      );
    });

    it('applies ghost variant classes', () => {
      render(<Button variant="ghost">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass('text-gray-500');
    });

    it('applies danger variant classes', () => {
      render(<Button variant="danger">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass(
        'border-red-200',
        'text-red-600'
      );
    });
  });

  describe('size prop', () => {
    it('applies md size by default', () => {
      render(<Button>Button</Button>);

      expect(screen.getByRole('button')).toHaveClass(
        'rounded-lg',
        'px-4',
        'py-2',
        'text-sm'
      );
    });

    it('applies xs size classes', () => {
      render(<Button size="xs">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass(
        'rounded',
        'px-2',
        'py-1',
        'text-xs'
      );
    });

    it('applies sm size classes', () => {
      render(<Button size="sm">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass(
        'rounded-lg',
        'px-2.5',
        'py-1.5',
        'text-sm'
      );
    });

    it('applies md size classes', () => {
      render(<Button size="md">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass(
        'rounded-lg',
        'px-4',
        'py-2',
        'text-sm'
      );
    });
  });

  describe('className prop', () => {
    it('forwards custom className to the button', () => {
      render(<Button className="custom-class">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('disabled prop', () => {
    it('applies disabled styles when disabled', () => {
      render(<Button disabled>Button</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it('does not call onClick when disabled', async () => {
      const onClick = jest.fn();
      render(
        <Button disabled onClick={onClick}>
          Button
        </Button>
      );

      await userEvent.click(screen.getByRole('button'));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('onClick handler', () => {
    it('calls onClick when clicked', async () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Button</Button>);

      await userEvent.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
