import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { UsuarioSelect } from '../../usuarios/components/UsuarioSelect'
import { useContactoMutations } from '../hooks/useContactoMutations'
import type { ContactoConRelaciones } from '../types'

interface Props {
  contacto: ContactoConRelaciones
  onAsignado: () => void
}

export function AsignarContacto({ contacto, onAsignado }: Props) {
  const [valor, setValor] = useState(contacto.asignado_a ?? '')
  const { actualizar, saving, error } = useContactoMutations()
  const cambio = valor !== (contacto.asignado_a ?? '')

  async function guardar() {
    const ok = await actualizar(contacto.id, { asignado_a: valor || null })
    if (ok) onAsignado()
  }

  return (
    <div className="flex flex-col gap-3">
      <UsuarioSelect label="Responsable de llamar" value={valor} onChange={setValor} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={guardar} disabled={!cambio} loading={saving}>
        Guardar asignación
      </Button>
    </div>
  )
}
