import { useState } from 'react'
import type { FormEvent } from 'react'
import { homePathFor, useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'
import { PasswordInput } from '../../components/ui'

export function LoginPage() {
  const { login } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const user = await login({ email, password })
      navigate(homePathFor(user))
    }
    catch (error) { setMessage(error instanceof Error ? error.message : t('login.failed')) }
    finally { setBusy(false) }
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-xl">
        <div className="flex flex-col">
          <p className="text-sm font-semibold uppercase text-blue-600 dark:text-blue-400">{t('brand')}</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{t('login.title')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('login.subtitle')}</p>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.email')}
            <input
              value={email}
              onChange={event => setEmail(event.target.value)}
              type="email"
              required
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.password')}
            <div className="mt-1">
              <PasswordInput
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              />
            </div>
          </label>
        </div>
        {message && <p className="text-sm text-red-600 dark:text-red-400" role="status">{message}</p>}
        <button
          disabled={busy}
          className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors"
        >
          {busy ? t('login.submitting') : t('login.submit')}
        </button>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('login.noAccount')} <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">{t('login.signUp')}</Link>
          </p>
        </div>
      </form>
    </main>
  )
}
