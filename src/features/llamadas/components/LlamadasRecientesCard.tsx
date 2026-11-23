import { Card } from '../../../components/ui/Card'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { LlamadasRecientes } from './LlamadasRecientes'

/** Tarjeta de llamadas recientes; solo visible con el módulo "llamadas" */
export function LlamadasRecientesCard() {
  const { puede } = usePermisos()
  if (!puede('llamadas')) return null
  return (
    <Card title="Llamadas recientes del equipo">
      <LlamadasRecientes />
    </Card>
  )
}
