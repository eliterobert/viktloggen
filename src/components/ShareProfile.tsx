'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  userId: string
}

interface SharedUser {
  id: string
  email: string
}

export default function ShareProfile({ userId }: Props) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [sharedWith, setSharedWith] = useState<SharedUser[]>([])
  const [loading, setLoading] = useState(false)

  // Hämta delade användare från API
  const fetchSharedWith = async () => {
    if (!userId) return

    const res = await fetch(`/api/profile-shares?profile_id=${userId}`)
    if (!res.ok) {
      setMessage('Kunde inte hämta delningar')
      return
    }

    const json = await res.json()
    setSharedWith(json.sharedUsers || [])
  }

  useEffect(() => {
    fetchSharedWith()
  }, [userId])

  // Skapa ny delning via API
  const handleShare = async () => {
    if (!email) return

    setMessage(null)
    setLoading(true)

    const response = await fetch('/api/share-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: userId, email }),
    })

    if (response.ok) {
      setMessage('✅ Delning skapad')
      setEmail('')
      fetchSharedWith()
    } else {
      const text = await response.text()
      setMessage(`❌ Fel: ${text}`)
    }

    setLoading(false)
  }

  // Ta bort delning
const handleUnshare = async (viewerId: string) => {
  setMessage(null)
  setLoading(true)

  const { data, error } = await supabase
    .from('profile_access')
    .delete()
    .eq('profile_id', userId)
    .eq('viewer_id', viewerId)
console.log('Rader som försöker tas bort:', {
  profile_id: userId,
  viewer_id: viewerId,
})
  console.log('Delete response data:', data)
  console.log('Delete response error:', error)

  if (error) {
    setMessage(`❌ Fel vid borttagning: ${error.message}`)
  } else {
    setSharedWith((prev) => prev.filter((u) => u.id !== viewerId))
    setMessage('✅ Delning borttagen')
  }

  setLoading(false)
}

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M13.828 10.172a4 4 0 015.657 0l1.415 1.414a4 4 0 010 5.657l-3.536 3.536a4 4 0 01-5.657 0l-1.414-1.414M10.172 13.828a4 4 0 01-5.657 0l-1.415-1.414a4 4 0 010-5.657l3.536-3.536a4 4 0 015.657 0l1.414 1.414" />
        </svg>
        Dela din profil
      </h3>

      <div className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-postadress"
          className="flex-1 rounded-l-md border border-gray-300 p-2 text-sm"
        />
        <button
          type="button"
          onClick={handleShare}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-md text-sm transition"
        >
          {loading ? 'Delar...' : 'Dela'}
        </button>
      </div>

      {message && <p className="text-sm text-gray-700">{message}</p>}

      {sharedWith.length > 0 ? (
        <div className="text-sm space-y-1">
          <p className="font-medium text-gray-800">🔒 Delas med:</p>
          <ul className="list-disc pl-4 space-y-1">
            {sharedWith.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-4"
              >
                <span className="truncate text-gray-600">{user.email}</span>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Knapp klickad', user.id)
                    handleUnshare(user.id)
                  }}
                  className="text-red-600 text-xs hover:underline"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Inga delningar ännu</p>
      )}
    </div>
  )
}
