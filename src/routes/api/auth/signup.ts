import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { z } from 'zod'
import { createUserWithPassword, getUserByEmail } from '~/lib/db/queries/users'
import {
  hashPassword,
  validatePasswordStrength,
  validateEmail,
} from '~/lib/auth/password'
import { createSession, createSessionCookie } from '~/lib/auth/session'

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(128),
})

export const Route = createFileRoute('/api/auth/signup')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const result = signupSchema.safeParse(body)

          if (!result.success) {
            return json({ error: 'Invalid input', details: result.error.errors }, { status: 400 })
          }

          const { email, name, password } = result.data

          // Validate email
          if (!validateEmail(email)) {
            return json({ error: 'Invalid email format' }, { status: 400 })
          }

          // Validate password strength
          const passwordValidation = validatePasswordStrength(password)
          if (!passwordValidation.valid) {
            return json(
              { error: 'Password does not meet requirements', details: passwordValidation.errors },
              { status: 400 }
            )
          }

          // Check if user already exists
          const existingUser = await getUserByEmail(email)
          if (existingUser) {
            return json({ error: 'Email already registered' }, { status: 409 })
          }

          // Hash password
          const hashedPassword = await hashPassword(password)

          // Create user
          const user = await createUserWithPassword(email, name, hashedPassword)

          // Create session
          const session = await createSession(user.id)

          return json(
            {
              success: true,
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
              },
            },
            {
              status: 201,
              headers: {
                'Set-Cookie': createSessionCookie(session.id, session.expiresAt),
              },
            }
          )
        } catch (error) {
          console.error('Signup error:', error)
          return json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
