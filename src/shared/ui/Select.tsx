'use client';

import { type JSX, type SelectHTMLAttributes, useId } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  showPlaceholder?: boolean;
  onChange?: (value: string | null) => void;
}

export function Select({
  options,
  label,
  placeholder = 'Select an option',
  showPlaceholder = true,
  value,
  onChange,
  className,
  id,
  ...props
}: SelectProps): JSX.Element {
  const generatedId = useId();
  const selectId = id || generatedId;

  const selectElement = (
    <select
      id={selectId}
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value || null)}
      className={twMerge(
        'rounded-md bg-surface px-3 py-2 text-[14px] text-text-primary',
        'shadow-border',
        'focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-0',
        'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted',
        className
      )}
      {...props}
    >
      {showPlaceholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (!label) {
    return selectElement;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-[14px] font-medium text-text-primary"
      >
        {label}
      </label>
      {selectElement}
    </div>
  );
}
