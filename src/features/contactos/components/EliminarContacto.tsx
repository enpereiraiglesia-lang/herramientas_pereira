import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { useContactoMutations } from '../hooks/useContactoMutations'

export function EliminarContacto({ id, nombre }: { id: string; nombre: string }) {
  const navigate = useNavigate()
  const { eliminar, saving, error } = useContactoMutations()

  async function handleClick() {
    if (!confirm(`¿Eliminar a ${nombre} y todo su historial de llamadas?`)) return
    const ok = await eliminar(id)
    if (ok) navigate('/contactos', { replace: true })
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant="danger" onClick={handleClick} loading={saving}>
        {!saving && <Trash2 />}
        Eliminar
      </Button>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  )
}
