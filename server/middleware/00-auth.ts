/**
 * HTTP Basic Authentication Middleware for Nitro
 *
 * Protects the entire site with a password.
 * Only active when SITE_PASSWORD is set in environment variables.
 */

import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  // Skip auth in development
  if (process.env.NODE_ENV === 'development') {
    return
  }

  // Only enable if SITE_PASSWORD is set
  const sitePassword = process.env.SITE_PASSWORD
  if (!sitePassword) {
    return
  }

  // Check Authorization header
  const authHeader = event.req.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    event.res.status = 401
    event.res.headers.set('WWW-Authenticate', 'Basic realm="Spicy Tales - Testing Access"')
    event.res.headers.set('Content-Type', 'text/plain')
    return 'Authentication required'
  }

  // Decode credentials
  const base64Credentials = authHeader.substring(6)
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
  const [_username, password] = credentials.split(':')

  // Check password (username can be anything)
  if (password !== sitePassword) {
    event.res.status = 401
    event.res.headers.set('WWW-Authenticate', 'Basic realm="Spicy Tales - Testing Access"')
    event.res.headers.set('Content-Type', 'text/plain')
    return 'Invalid credentials'
  }

  // Auth successful, continue to app
})
