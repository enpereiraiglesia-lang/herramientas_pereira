import type { SelectHTMLAttributes } from 'react'
import { Field, inputClass } from './Field'

export interface Option {
  value: string
  label: string
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  name: string
  options: Option[]
  placeholder?: string
}

export function Select({ label, name, options, placeholder, ...rest }: Props) {
  return (
    <Field label={label} htmlFor={name}>
      <select id={name} name={name} className={inputClass} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
