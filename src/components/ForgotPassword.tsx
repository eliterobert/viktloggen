'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Ett återställningsmail har skickats.')
    }
  }

  return (
    <div className="space-y-4 max-w-sm mx-auto mt-10 p-4 border rounded">
      <h2 className="text-xl font-bold">Glömt lösenord?</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="Din e-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded" type="submit">
          Skicka återställningslänk
        </button>
        <button
          type="button"
          className="text-sm underline text-blue-600"
          onClick={onBack}
        >
          Tillbaka till inloggning
        </button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}