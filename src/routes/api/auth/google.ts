import { createFileRoute } from '@tanstack/react-router'
import { google, generateOAuthState } from '~/lib/auth/oauth'

export const Route = createFileRoute('/api/auth/google')({
  server: {
    handlers: {
      GET: async () => {
        const state = generateOAuthState()
        const url = google.createAuthorizationURL(state, ['email', 'profile'])

        return new Response(null, {
          status: 302,
          headers: {
            Location: url.toString(),
            'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
          },
        })
      },
    },
  },
})
