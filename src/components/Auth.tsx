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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
  }

  if (showReset) {
    return <ForgotPassword onBack={() => setShowReset(false)} />
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-4 border rounded shadow space-y-4">
      <h2 className="text-xl font-bold">
        {isLogin ? 'Logga in' : 'Registrera dig'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Förnamn"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Efternamn"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </>
        )}
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button className="w-full bg-blue-500 text-white p-2 rounded" type="submit">
          {isLogin ? 'Logga in' : 'Registrera'}
        </button>

        <div className="flex justify-between text-sm">
          <span
            className="text-blue-600 underline cursor-pointer"
            onClick={() => setShowReset(true)}
          >
            Glömt lösenord?
          </span>
          <span
            className="text-blue-600 underline cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Skapa konto' : 'Har du ett konto? Logga in'}
          </span>
        </div>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
