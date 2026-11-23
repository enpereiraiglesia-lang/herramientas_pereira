# Gestión Integral de Herramientas

App para registrar a las personas contactadas en la calle (evangelismo), darles seguimiento por llamada y asignar quién las llama.

**Stack:** React + Vite + TypeScript · Tailwind CSS v4 · Supabase · React Router

## Configuración

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Copia la URL y la `anon key` (Project Settings → API) en `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. Crea las tablas ejecutando las migraciones **en orden**:
   - **SQL Editor de Supabase:** pega y ejecuta primero `20261122000000_esquema_inicial.sql` y luego `20261122000100_usuarios_y_roles.sql` (carpeta `supabase/migrations/`).
   - **CLI:** `npx supabase login`, `npx supabase link --project-ref <id>` y luego `npx supabase db push`.
4. **URLs de redirección** (Authentication → URL Configuration):
   - Site URL: `http://localhost:5173` (en producción, tu dominio).
   - Redirect URLs: `http://localhost:5173/**`
5. **Primer administrador** (`enpereiraiglesia@gmail.com`): en Authentication → Users → *Add user* → *Create new user*, escribe ese correo, una contraseña y marca *Auto Confirm User*. Al crearse, queda automáticamente como **administrador**. (También funciona si se registra desde la app.)
6. Instala y arranca:
   ```
   npm install
   npm run dev
   ```

> Si no quieres que se confirme el correo al registrarse: Authentication → Providers → Email → desactiva "Confirm email".

## Roles

| Rol | Puede |
|---|---|
| **administrador** | Todo lo del colaborador + ver la pantalla *Usuarios*, cambiar roles y eliminar cualquier contacto o llamada. |
| **colaborador** | Registrar contactos, asignarlos, registrar llamadas y editar/eliminar lo que él mismo registró. |

Toda persona que se registre entra como colaborador. Para agregar más administradores iniciales por correo:
```sql
insert into public.administradores_iniciales (email) values ('otro@correo.com');
```

## Base de datos

| Tabla | Para qué |
|---|---|
| `usuarios` | Personas del equipo que usan la app (se crea sola al registrarse): nombre, correo, teléfono y rol (`administrador` o `colaborador`). |
| `administradores_iniciales` | Correos que reciben rol administrador al crear su cuenta. |
| `contactos` | Persona evangelizada: nombre, teléfono, dirección, observaciones, lugar y fecha de contacto, estado y `asignado_a` (quién debe llamarla). |
| `llamadas` | Historial de seguimiento: quién llamó (`llamado_por`), fecha, resultado, notas y próxima llamada. |

Al registrar una llamada, un trigger actualiza en el contacto la última llamada, la próxima llamada y el estado.
Todas las tablas tienen RLS: el equipo autenticado ve y edita todo; solo quien registró un contacto (o un admin) puede eliminarlo.

## Estructura

```
src/
  components/ui/       Button, Input, Select, TextArea, Card, Badge, Alert...
  components/layout/   Header (menú hamburguesa en móvil), Layout
  features/
    auth/              Login/registro, AuthProvider, ProtectedRoute
    contactos/         Listado, filtros, formulario, detalle, asignación, resumen
    llamadas/          Registrar llamada, historial, llamadas recientes
    usuarios/          Selector de responsables, roles, pantalla de usuarios
  pages/               Una página por ruta
  lib/                 Cliente Supabase, utilidades
  types/database.ts    Tipos de la BD
supabase/migrations/   Esquema SQL
```

Regenerar tipos después de cambiar la BD:
```
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```
