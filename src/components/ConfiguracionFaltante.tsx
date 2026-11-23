import { Settings } from 'lucide-react'

/** Pantalla que se muestra si la app se compiló sin las variables de Supabase */
export function ConfiguracionFaltante({ variables }: { variables: string[] }) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Settings className="h-6 w-6" />
        </span>
        <h1 className="text-xl font-semibold text-navy-900">Falta configurar la aplicación</h1>
        <p className="mt-2 text-sm text-slate-600">
          La aplicación se compiló sin estas variables de entorno:
        </p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {variables.map((v) => (
            <li key={v}>
              <code className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-navy-900">{v}</code>
            </li>
          ))}
        </ul>
        <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
          <li>
            En Vercel: <strong>Settings → Environment Variables</strong>, créalas con el valor de Supabase (Project
            Settings → API) para el entorno <strong>Production</strong>.
          </li>
          <li>
            Vuelve a desplegar: <strong>Deployments → Redeploy</strong>. Las variables se aplican al compilar.
          </li>
          <li>En tu computador, defínelas en el archivo <code>.env.local</code>.</li>
        </ol>
      </div>
    </main>
  )
}
