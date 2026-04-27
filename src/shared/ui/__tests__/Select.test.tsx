import { fireEvent, render, screen } from '@testing-library/react';
import { Select, type SelectOption } from '../Select';

beforeEach(() => jest.clearAllMocks());

describe('Select', () => {
  const options: SelectOption[] = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
  ];

  describe('basic rendering', () => {
    it('renders with default placeholder', () => {
      render(<Select options={options} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Select an option' })
      ).toBeInTheDocument();
    });

    it('renders all provided options', () => {
      render(<Select options={options} />);

      expect(
        screen.getByRole('option', { name: 'Option A' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Option B' })
      ).toBeInTheDocument();
    });

    it('renders without placeholder when showPlaceholder is false', () => {
      render(<Select options={options} showPlaceholder={false} />);

      expect(
        screen.queryByRole('option', { name: 'Select an option' })
      ).not.toBeInTheDocument();
    });

    it('uses custom placeholder when provided', () => {
      render(<Select options={options} placeholder="Choose one" />);

      expect(
        screen.getByRole('option', { name: 'Choose one' })
      ).toBeInTheDocument();
    });
  });

  describe('value handling', () => {
    it('sets the selected value', () => {
      render(<Select options={options} value="a" />);

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('a');
    });

    it('calls onChange when an option is selected', () => {
      const onChange = jest.fn();
      render(<Select options={options} onChange={onChange} />);

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'b' },
      });

      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('calls onChange with null when placeholder is selected', () => {
      const onChange = jest.fn();
      render(<Select options={options} value="a" onChange={onChange} />);

      fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('label rendering', () => {
    it('renders label when provided', () => {
      render(<Select options={options} label="Select label" />);

      expect(screen.getByText('Select label')).toBeInTheDocument();
    });

    it('associates label with select via htmlFor', () => {
      render(<Select options={options} label="My label" id="my-select" />);

      const label = screen.getByText('My label');
      expect(label).toHaveAttribute('for', 'my-select');
    });

    it('does not render label wrapper when label is not provided', () => {
      const { container } = render(<Select options={options} />);

      expect(container.querySelector('label')).not.toBeInTheDocument();
    });
  });

  describe('id prop', () => {
    it('applies id to the select element', () => {
      render(<Select options={options} id="custom-id" />);

      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'custom-id');
    });

    it('always generates an id when not provided', () => {
      render(<Select options={options} />);

      expect(screen.getByRole('combobox')).toHaveAttribute('id');
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      render(<Select options={options} className="custom-class" />);

      expect(screen.getByRole('combobox')).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('marks select as required when required prop is passed', () => {
      render(<Select options={options} required />);

      expect(screen.getByRole('combobox')).toHaveAttribute('required');
    });

    it('marks select as disabled when disabled prop is passed', () => {
      render(<Select options={options} disabled />);

      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('applies disabled styling classes', () => {
      render(<Select options={options} disabled />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass(
        'disabled:cursor-not-allowed',
        'disabled:bg-surface-subtle',
        'disabled:text-text-muted'
      );
    });
  });
});
