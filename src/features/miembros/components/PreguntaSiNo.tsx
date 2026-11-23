interface Props {
  pregunta: string
  name: string
  valor: boolean
  onChange: (valor: boolean) => void
}

/** Pregunta con dos opciones grandes (Sí / No), cómoda en celular */
export function PreguntaSiNo({ pregunta, name, valor, onChange }: Props) {
  const opcion = (activo: boolean) =>
    `flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold ring-1 ring-inset transition-colors ${
      activo ? 'bg-primary-600 text-white ring-primary-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'
    }`

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium text-navy-900">{pregunta}</legend>
      <div className="flex gap-2">
        <label className={opcion(valor)}>
          <input type="radio" name={name} className="sr-only" checked={valor} onChange={() => onChange(true)} />
          Sí
        </label>
        <label className={opcion(!valor)}>
          <input type="radio" name={name} className="sr-only" checked={!valor} onChange={() => onChange(false)} />
          No
        </label>
      </div>
    </fieldset>
  )
}
