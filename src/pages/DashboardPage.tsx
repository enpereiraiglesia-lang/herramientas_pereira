import { MisPendientes } from '../features/contactos/components/MisPendientes'
import { ResumenStats } from '../features/contactos/components/ResumenStats'
import { LlamadasRecientesCard } from '../features/llamadas/components/LlamadasRecientesCard'
import { Bienvenida } from '../features/usuarios/components/Bienvenida'

/** Landing page: a donde llega el usuario después de iniciar sesión */
export function DashboardPage() {
  return (
    <>
      <Bienvenida />
      <div className="flex flex-col gap-8">
        <ResumenStats />
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <section className="xl:col-span-2">
            <h2 className="mb-1 text-base font-semibold text-navy-900">Mis llamadas pendientes</h2>
            <p className="mb-4 text-sm text-slate-500">Contactos asignados a ti que necesitan seguimiento</p>
            <MisPendientes />
          </section>
          <div>
            <LlamadasRecientesCard />
          </div>
        </div>
      </div>
    </>
  )
}
