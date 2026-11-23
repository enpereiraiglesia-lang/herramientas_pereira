import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { RUTA_LANDING } from '../../../lib/rutas'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Alert } from '../../../components/ui/Alert'

const ERRORES: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión.',
  'User already registered': 'Ya existe una cuenta con ese correo.',
}

function traducirError(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Ocurrió un error'
  return ERRORES[msg] ?? msg
}

export function LoginForm() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    setError(null)
    setMensaje(null)
    setLoading(true)
    try {
      if (modo === 'login') {
        await signIn(email, password)
        navigate(RUTA_LANDING, { replace: true })
      } else {
        const conSesion = await signUp(email, password, String(form.get('nombre')))
        if (conSesion) navigate(RUTA_LANDING, { replace: true })
        else setMensaje('Revisa tu correo para confirmar la cuenta. El enlace te llevará a la página de inicio.')
      }
    } catch (err) {
      setError(traducirError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert>{error}</Alert>}
      {mensaje && <Alert type="success">{mensaje}</Alert>}
      {modo === 'registro' && <Input label="Tu nombre" name="nombre" required autoComplete="name" />}
      <Input label="Correo" name="email" type="email" required autoComplete="email" />
      <Input label="Contraseña" name="password" type="password" required minLength={6} autoComplete="current-password" />
      <Button type="submit" loading={loading} fullWidth>
        {modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </Button>
      <Button type="button" variant="ghost" onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}>
        {modo === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </Button>
    </form>
  )
}
