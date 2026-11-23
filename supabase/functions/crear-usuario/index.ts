// Edge Function: crea un usuario (colaborador o administrador).
// Solo la puede usar un administrador. La service_role key vive solo aquí (servidor).
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ROLES = ['administrador', 'colaborador'] as const

function responder(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return responder(405, { error: 'Método no permitido' })

  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // 1) ¿Quién llama? Usamos su propio token para verificar que sea administrador
  const authHeader = req.headers.get('Authorization') ?? ''
  const cliente = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: auth } = await cliente.auth.getUser()
  if (!auth.user) return responder(401, { error: 'Debes iniciar sesión' })

  const { data: esAdmin, error: rpcError } = await cliente.rpc('es_admin')
  if (rpcError || !esAdmin) return responder(403, { error: 'Solo un administrador puede crear usuarios' })

  // 2) Validar datos
  let body: { nombre?: string; email?: string; password?: string; telefono?: string; rol?: string }
  try {
    body = await req.json()
  } catch {
    return responder(400, { error: 'Datos inválidos' })
  }
  const nombre = body.nombre?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''
  const telefono = body.telefono?.trim() || null
  const rol = ROLES.includes(body.rol as (typeof ROLES)[number]) ? body.rol : 'colaborador'

  if (!nombre) return responder(400, { error: 'El nombre es obligatorio' })
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return responder(400, { error: 'Correo inválido' })
  if (password.length < 6) return responder(400, { error: 'La contraseña debe tener al menos 6 caracteres' })

  // 3) Crear la cuenta con la service_role. El rol va en app_metadata (el usuario no puede modificarlo).
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, telefono },
    app_metadata: { rol },
  })

  if (error) {
    const yaExiste = /already|registered|exists/i.test(error.message)
    return responder(400, { error: yaExiste ? 'Ya existe un usuario con ese correo' : error.message })
  }

  return responder(200, { id: data.user.id, email, rol })
})
