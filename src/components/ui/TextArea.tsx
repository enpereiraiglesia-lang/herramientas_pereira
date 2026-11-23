import type { TextareaHTMLAttributes } from 'react'
import { Field, inputClass } from './Field'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
}

export function TextArea({ label, name, rows = 4, ...rest }: Props) {
  return (
    <Field label={label} htmlFor={name}>
      <textarea id={name} name={name} rows={rows} className={inputClass} {...rest} />
    </Field>
  )
}
