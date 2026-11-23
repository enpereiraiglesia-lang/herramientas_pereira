import type { InputHTMLAttributes } from 'react'
import { Field, inputClass } from './Field'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string
}

export function Input({ label, name, error, className = '', ...rest }: Props) {
  return (
    <Field label={label} htmlFor={name} error={error}>
      <input id={name} name={name} className={`${inputClass} ${className}`} {...rest} />
    </Field>
  )
}
