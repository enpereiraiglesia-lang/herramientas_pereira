import { useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { OPCIONES_ROL, type NuevoUsuarioInput, type RolUsuario } from '../types'

interface Props {
  saving: boolean
  error: string | null
  onSubmit: (input: NuevoUsuarioInput) => Promise<boolean>
  onCancel: () => void
}

export function NuevoUsuarioForm({ saving, error, onSubmit, onCancel }: Props) {
  const [creado, setCreado] = useState<{ email: string; password: string } | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const input: NuevoUsuarioInput = {
      nombre: String(f.get('nombre')).trim(),
      email: String(f.get('email')).trim(),
      password: String(f.get('password')),
      telefono: String(f.get('telefono') ?? '').trim() || null,
      rol: f.get('rol') as RolUsuario,
    }
    const ok = await onSubmit(input)
    if (ok) {
      setCreado({ email: input.email, password: input.password })
      form.reset()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert>{error}</Alert>}
      {creado && (
        <Alert type="success">
          Usuario creado. Compártele sus datos de acceso: <strong>{creado.email}</strong> / contraseña{' '}
          <strong>{creado.password}</strong>. Podrá iniciar sesión de inmediato.
        </Alert>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Nombre completo *" name="nombre" required autoComplete="off" />
        <Input label="Correo *" name="email" type="email" required autoComplete="off" />
        <Input label="Teléfono" name="telefono" type="tel" inputMode="tel" />
        <Select label="Rol" name="rol" options={OPCIONES_ROL} defaultValue="colaborador" />
        <Input
          label="Contraseña temporal *"
          name="password"
          type="text"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cerrar
        </Button>
        <Button type="submit" loading={saving}>
          Crear usuario
        </Button>
      </div>
    </form>
  )
}
