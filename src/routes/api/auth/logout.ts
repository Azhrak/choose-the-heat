import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getSessionFromRequest, deleteSession, deleteSessionCookie } from '~/lib/auth/session'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const session = await getSessionFromRequest(request)

          if (session) {
            await deleteSession(session.id)
          }

          return json(
            { success: true },
            {
              headers: {
                'Set-Cookie': deleteSessionCookie(),
              },
            }
          )
        } catch (error) {
          console.error('Logout error:', error)
          return json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
