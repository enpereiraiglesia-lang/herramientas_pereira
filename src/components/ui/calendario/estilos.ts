/** Clases compartidas por los calendarios */

export const botonNav =
  'flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy-900 disabled:pointer-events-none disabled:opacity-30'

export function celdaGrande(activo: boolean, actual: boolean) {
  return `flex h-11 items-center justify-center rounded-lg text-sm capitalize transition-colors disabled:pointer-events-none disabled:text-slate-300 ${
    activo
      ? 'bg-primary-600 font-semibold text-white shadow-sm hover:bg-primary-700'
      : actual
        ? 'font-semibold text-primary-700 ring-1 ring-inset ring-primary-300 hover:bg-primary-50'
        : 'text-slate-700 hover:bg-slate-100'
  }`
}
