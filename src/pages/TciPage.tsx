import { useParams } from 'react-router-dom'
import { GrupoTciDetalle } from '../features/tci/components/GrupoTciDetalle'
import { SalidaDetalle } from '../features/tci/components/SalidaDetalle'
import { SalidasLista } from '../features/tci/components/SalidasLista'

export function TciPage() {
  return <SalidasLista />
}

export function SalidaTciPage() {
  const { salidaId = '' } = useParams()
  return <SalidaDetalle key={salidaId} id={salidaId} />
}

export function GrupoTciPage() {
  const { grupoId = '' } = useParams()
  return <GrupoTciDetalle key={grupoId} id={grupoId} />
}
