import { useState } from 'react'
import type { FormEvent } from 'react'
import { Lock, Mail } from 'lucide-react'
import { homePathFor, useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'
import { PasswordInput } from '../../components/ui'
import { PageTitle } from '../../components/PageTitle'

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
      <PageTitle title={t('nav.login')} />
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-xl">
        <div className="flex flex-col">
          <p className="text-sm font-semibold uppercase text-primary">{t('brand')}</p>
          <h1 className="mt-1 text-3xl font-bold text-fg">{t('login.title')}</h1>
          <p className="mt-2 text-fg-muted">{t('login.subtitle')}</p>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-fg">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-fg-subtle" aria-hidden />
              {t('common.email')}
            </span>
            <input
              value={email}
              onChange={event => setEmail(event.target.value)}
              type="email"
              required
              className="mt-1 w-full p-2 border border-line-strong rounded-md bg-surface"
            />
          </label>
          <label className="block text-sm font-medium text-fg">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-fg-subtle" aria-hidden />
              {t('common.password')}
            </span>
            <div className="mt-1">
              <PasswordInput
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full p-2 border border-line-strong rounded-md bg-surface"
              />
            </div>
          </label>
        </div>
        {message && <p className="text-sm text-danger" role="status">{message}</p>}
        <button
          disabled={busy}
          className="w-full bg-primary hover:bg-primary/90 text-primary-fg font-semibold py-2 rounded-md transition-colors"
        >
          {busy ? t('login.submitting') : t('login.submit')}
        </button>
        <div className="text-center mt-4">
          <p className="text-sm text-fg-muted">
            {t('login.noAccount')} <Link to="/signup" className="text-primary hover:underline">{t('login.signUp')}</Link>
          </p>
        </div>
      </form>
    </main>
  )
}
