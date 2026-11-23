import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { linkBoton } from '../../../components/ui/estilos'
import { Card } from '../../../components/ui/Card'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Spinner } from '../../../components/ui/Spinner'
import { useAuth } from '../../auth/hooks/useAuth'
import { LlamadaForm } from '../../llamadas/components/LlamadaForm'
import { LlamadasHistorial } from '../../llamadas/components/LlamadasHistorial'
import { useLlamadas } from '../../llamadas/hooks/useLlamadas'
import type { LlamadaInput } from '../../llamadas/types'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { useContacto } from '../hooks/useContacto'
import { AsignarContacto } from './AsignarContacto'
import { ContactoInfo } from './ContactoInfo'
import { EliminarContacto } from './EliminarContacto'

export function ContactoDetalle({ id }: { id: string }) {
  const { user } = useAuth()
  const { puede, esAdmin } = usePermisos()
  const { contacto, loading, error, reload } = useContacto(id)
  const verLlamadas = puede('llamadas')
  const llamadas = useLlamadas(verLlamadas ? id : undefined)

  if (loading && !contacto) return <Spinner />
  if (error || !contacto) return <Alert>{error ?? 'Contacto no encontrado'}</Alert>

  async function registrarLlamada(input: LlamadaInput) {
    const ok = await llamadas.registrar({ ...input, llamado_por: user?.id })
    if (ok) await reload() // el trigger actualiza estado y fechas del contacto
    return ok
  }

  const puedeEliminar = esAdmin || contacto.registrado_por === user?.id
  const verAsignar = puede('asignar')

  return (
    <>
      <PageHeader
        title={contacto.nombre}
        subtitle={`Asignado a: ${contacto.asignado?.nombre ?? 'nadie'}`}
        actions={
          <>
            <Link to={`/contactos/${id}/editar`} className={linkBoton.secondary}>
              <Pencil />
              Editar
            </Link>
            {puedeEliminar && <EliminarContacto id={id} nombre={contacto.nombre} />}
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`flex flex-col gap-6 ${verLlamadas || verAsignar ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <Card title="Información">
            <ContactoInfo contacto={contacto} />
          </Card>
          {verLlamadas && (
            <Card title="Registrar llamada">
              <LlamadaForm
                contactoId={id}
                saving={llamadas.saving}
                error={llamadas.saveError}
                onSubmit={registrarLlamada}
              />
            </Card>
          )}
        </div>
        {(verLlamadas || verAsignar) && (
          <div className="flex flex-col gap-6">
            {verAsignar && (
              <Card title="Asignación">
                <AsignarContacto key={contacto.asignado_a ?? 'none'} contacto={contacto} onAsignado={reload} />
              </Card>
            )}
            {verLlamadas && (
              <Card title={`Historial de llamadas (${llamadas.llamadas.length})`}>
                <LlamadasHistorial
                  llamadas={llamadas.llamadas}
                  loading={llamadas.loading}
                  error={llamadas.error}
                  usuarioId={user?.id}
                  onEliminar={llamadas.eliminar}
                />
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  )
}
