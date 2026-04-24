'use client'

import { useId, type SelectHTMLAttributes, type JSX } from 'react'
import { twMerge } from 'tailwind-merge'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[]
  label?: string
  placeholder?: string
  showPlaceholder?: boolean
  onChange?: (value: string | null) => void
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
  const generatedId = useId()
  const selectId = id || generatedId

  const selectElement = (
    <select
      id={selectId}
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value || null)}
      className={twMerge(
        'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900',
        'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
        'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
        className,
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
  )

  if (!label) {
    return selectElement
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {selectElement}
    </div>
  )
}