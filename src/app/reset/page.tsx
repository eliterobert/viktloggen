'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../app/../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Användaren är i återställningsläge')
      }
    })
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setError('Lösenorden matchar inte.')
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Lösenordet är uppdaterat! Du loggas in...')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-4 border rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Återställ lösenord</h2>

      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="password"
          placeholder="Nytt lösenord"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Bekräfta lösenord"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button className="w-full bg-blue-500 text-white p-2 rounded" type="submit">
          Spara nytt lösenord
        </button>

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}