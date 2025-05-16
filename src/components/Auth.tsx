'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import ForgotPassword from './ForgotPassword'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [showReset, setShowReset] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setError(error.message)
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Skapa profil med namn
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
        })
      }
    }
    setLoading(false)
  }

  if (showReset) {
    return <ForgotPassword onBack={() => setShowReset(false)} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          {isLogin ? 'Logga in' : 'Registrera dig'}
        </h2>

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Förnamn"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Efternamn"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </>
        )}

        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />

        {error && (
          <p className="text-red-600 text-center font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
        >
          {loading ? (isLogin ? 'Loggar in...' : 'Registrerar...') : isLogin ? 'Logga in' : 'Registrera'}
        </button>

        <div className="flex justify-between text-sm text-indigo-700">
          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="underline hover:text-indigo-900"
          >
            Glömt lösenord?
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
            }}
            className="underline hover:text-indigo-900"
          >
            {isLogin ? 'Skapa konto' : 'Har du redan ett konto? Logga in'}
          </button>
        </div>
      </form>
    </div>
  )
}
