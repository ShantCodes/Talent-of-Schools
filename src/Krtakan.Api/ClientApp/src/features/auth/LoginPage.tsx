import { useState } from 'react'
import type { FormEvent } from 'react'
import { authApi } from './authApi'
import { authStore } from './authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try { const auth = await authApi.login({ email, password }); authStore.save(auth); setMessage(`Welcome, ${auth.user.fullName}.`) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to sign in.') }
    finally { setBusy(false) }
    }
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-xl">
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">KRTAKAN</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Competition portal</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to submit or review performances.</p>
        </div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
          <input
            value={email}
            onChange={event => setEmail(event.target.value)}
            type="email"
            required
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
          <input
            value={password}
            onChange={event => setPassword(event.target.value)}
            type="password"
            required
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          />
        </label>
        {message && <p className="text-sm text-red-600 dark:text-red-400" role="status">{message}</p>}
        <button
          disabled={busy}
          className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
