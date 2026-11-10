import { useState } from 'react'
import type { FormEvent } from 'react'
import { authApi } from './authApi'
import { authStore } from './authStore'
import { Link } from 'react-router-dom'

export function SignupPage() {
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolId, setSchoolId] = useState<number | null>(null)
  const [grade, setGrade] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const auth = await authApi.register({
        name,
        lastName,
        birthDate,
        email,
        password,
        schoolId,
        grade
      })
      authStore.save(auth)
      setMessage(`Welcome, ${auth.user.fullName}.`)
    }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to register.') }
    finally { setBusy(false) }
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-xl">
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">KRTAKAN</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Join the competition</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create an account to participate.</p>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              type="text"
              required
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
            <input
              value={lastName}
              onChange={event => setLastName(event.target.value)}
              type="text"
              required
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Birth Date
            <input
              value={birthDate}
              onChange={event => setBirthDate(event.target.value)}
              type="date"
              required
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            />
          </label>
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
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              School ID
              <input
                value={schoolId !== null ? schoolId.toString() : ''}
                onChange={event => setSchoolId(event.target.value ? parseInt(event.target.value) : null)}
                type="number"
                className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Grade
              <input
                value={grade !== null ? grade.toString() : ''}
                onChange={event => setGrade(event.target.value ? parseInt(event.target.value) : null)}
                type="number"
                className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              />
            </label>
          </div>
        </div>
        {message && <p className="text-sm text-red-600 dark:text-red-400" role="status">{message}</p>}
        <button
          disabled={busy}
          className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors"
        >
          {busy ? 'Registering…' : 'Register'}
        </button>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </form>
    </main>
  )
}
