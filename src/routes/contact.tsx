import { createFileRoute } from '@tanstack/react-router'
import { useState, FormEvent } from 'react'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    // Honeypot field - hidden from users, bots will fill it
    website: '',
  })

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Bot protection: Check honeypot field
    if (formData.website) {
      // This is likely a bot submission, silently fail
      console.warn('Honeypot triggered - possible bot submission')
      setStatus('success')
      return
    }

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error')
      setErrorMessage('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setStatus('submitting')

    // TODO: Implement actual message sending
    // For now, just simulate a delay
    setTimeout(() => {
      setStatus('success')
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        website: '',
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Mail className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have a question, suggestion, or feedback? We'd love to hear from you!
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Message Sent!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Your name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="What's this about?"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical"
                  placeholder="Tell us what's on your mind..."
                  required
                />
              </div>

              {/* Honeypot field - hidden from users */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                We typically respond within 24-48 hours
              </p>
            </form>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            For urgent matters or account issues, please check our{' '}
            <a href="/terms" className="text-rose-600 dark:text-rose-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-rose-600 dark:text-rose-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
