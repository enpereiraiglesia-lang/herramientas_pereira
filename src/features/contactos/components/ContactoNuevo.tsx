import { useNavigate } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { useAuth } from '../../auth/hooks/useAuth'
import { useContactoMutations } from '../hooks/useContactoMutations'
import type { ContactoInput } from '../types'
import { ContactoForm } from './ContactoForm'

export function ContactoNuevo() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { crear, saving, error } = useContactoMutations()

  async function handleSubmit(input: ContactoInput) {
    const creado = await crear({ ...input, registrado_por: user?.id })
    if (creado) navigate(`/contactos/${creado.id}`, { replace: true })
  }

  return (
    <Card>
      <ContactoForm saving={saving} error={error} onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
    </Card>
  )
}
