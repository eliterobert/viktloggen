'use client'

import { useState } from 'react'
import { supabase } from '../app/lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
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

      // När användaren skapas, spara namn i `profiles`
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
        })
      }
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-4 border rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold">{isLogin ? 'Logga in' : 'Registrera dig'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <input
              className="w-full p-2 border rounded"
              placeholder="Förnamn"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Efternamn"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </>
        )}
        <input
          className="w-full p-2 border rounded"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full p-2 border rounded"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full p-2 bg-blue-500 text-white rounded">
          {isLogin ? 'Logga in' : 'Registrera'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        <p
          className="text-sm text-blue-600 cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Inget konto? Registrera dig' : 'Har du ett konto? Logga in'}
        </p>
      </form>
    </div>
  )
}