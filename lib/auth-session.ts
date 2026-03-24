import { auth } from '@/auth'

export type SessionUser = {
  id: number
  role: string
  email: string
  name: string | null | undefined
  hospital_name: string | null
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  const id = Number(session?.user?.id)

  if (!session?.user || !Number.isInteger(id) || !session.user.role || !session.user.email) {
    return null
  }

  return {
    id,
    role: session.user.role,
    email: session.user.email,
    name: session.user.name,
    hospital_name: session.user.hospital_name ?? null
  }
}
