import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { authApi } from './authApi'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useI18n } from '../../i18n/I18nContext'
import type { School, SchoolResponse } from './types'
import { PasswordInput } from '../../components/ui'
import { normalizeIranMobile, phoneInputProps } from '../../lib/phone'

const boxClass = 'w-full p-2 border border-line-strong rounded-md bg-surface'
const inputClass = `mt-1 ${boxClass}`
const labelClass = 'block text-sm font-medium text-fg'

export function SignupPage() {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [schoolId, setSchoolId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [registered, setRegistered] = useState(false)
  const [busy, setBusy] = useState(false)
  const [schools, setSchools] = useState<School[]>([])

  useEffect(() => {
    async function fetchSchools() {
      try {
        const data = await api<SchoolResponse>('/api/schools?pageNumber=1&pageSize=100')
        setSchools(data.items)
      } catch (e) {
        console.error('Failed to fetch schools', e)
      }
    }
    fetchSchools()
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    const normalizedPhone = normalizeIranMobile(phoneNumber)
    if (!normalizedPhone) {
      setMessage(t('error.invalidPhone'))
      setBusy(false)
      return
    }
    if (password.length < 8) {
      setMessage(t('error.passwordLength'))
      setBusy(false)
      return
    }
    if (password !== confirmPassword) {
      setMessage(t('error.passwordMismatch'))
      setBusy(false)
      return
    }
    try {
      await authApi.register({
        name,
        lastName,
        email,
        password,
        phoneNumber: normalizedPhone,
        schoolId,
      })
      setRegistered(true)
      setMessage(t('signup.success'))
    }
    catch (error) { setMessage(error instanceof Error ? error.message : t('signup.failed')) }
    finally { setBusy(false) }
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-line bg-surface p-8 shadow-xl">
        <div className="flex flex-col">
          <p className="text-sm font-semibold uppercase text-primary">{t('brand')}</p>
          <h1 className="mt-1 text-3xl font-bold text-fg">{t('signup.title')}</h1>
          <p className="mt-2 text-fg-muted">{t('signup.subtitle')}</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={labelClass}>
              {t('common.firstName')}
              <input value={name} onChange={event => setName(event.target.value)} type="text" required className={inputClass} />
            </label>
            <label className={labelClass}>
              {t('common.lastName')}
              <input value={lastName} onChange={event => setLastName(event.target.value)} type="text" required className={inputClass} />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={labelClass}>
              {t('common.email')}
              <input value={email} onChange={event => setEmail(event.target.value)} type="email" required className={inputClass} />
            </label>
            <label className={labelClass}>
              {t('common.phone')}
              <input {...phoneInputProps} value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} required className={inputClass} />
            </label>
          </div>
          <label className={labelClass}>
            {t('common.password')}
            <div className="mt-1">
              <PasswordInput value={password} onChange={event => setPassword(event.target.value)} required minLength={8} maxLength={72} autoComplete="new-password" className={boxClass} />
            </div>
          </label>
          <label className={labelClass}>
            {t('common.confirmPassword')}
            <div className="mt-1">
              <PasswordInput value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required maxLength={72} autoComplete="new-password" className={boxClass} />
            </div>
          </label>
          <label className={labelClass}>
            {t('common.school')}
            <select
              value={schoolId !== null ? schoolId.toString() : ''}
              onChange={event => setSchoolId(event.target.value ? parseInt(event.target.value) : null)}
              className={inputClass}
            >
              <option value="" disabled>{t('signup.selectSchool')}</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {message && <p className={`text-sm ${registered ? 'text-success' : 'text-danger'}`} role="status">{message}</p>}
        <button
          disabled={busy || registered}
          className="w-full bg-primary hover:bg-primary/90 text-primary-fg font-semibold py-2 rounded-md transition-colors"
        >
          {busy ? t('signup.submitting') : t('signup.submit')}
        </button>
        <div className="text-center mt-4">
          <p className="text-sm text-fg-muted">
            {t('signup.haveAccount')} <Link to="/login" className="text-primary hover:underline">{t('signup.signIn')}</Link>
          </p>
        </div>
      </form>
    </main>
  )
}
