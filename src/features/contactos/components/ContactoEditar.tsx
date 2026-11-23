import { useNavigate } from 'react-router-dom'
import { Alert } from '../../../components/ui/Alert'
import { Card } from '../../../components/ui/Card'
import { Spinner } from '../../../components/ui/Spinner'
import { useContacto } from '../hooks/useContacto'
import { useContactoMutations } from '../hooks/useContactoMutations'
import type { ContactoInput } from '../types'
import { ContactoForm } from './ContactoForm'

export function ContactoEditar({ id }: { id: string }) {
  const navigate = useNavigate()
  const { contacto, loading, error: loadError } = useContacto(id)
  const { actualizar, saving, error } = useContactoMutations()

  if (loading) return <Spinner />
  if (loadError || !contacto) return <Alert>{loadError ?? 'Contacto no encontrado'}</Alert>

  async function handleSubmit(input: ContactoInput) {
    const ok = await actualizar(id, input)
    if (ok) navigate(`/contactos/${id}`, { replace: true })
  }

  return (
    <Card>
      <ContactoForm
        inicial={contacto}
        saving={saving}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </Card>
  )
}
