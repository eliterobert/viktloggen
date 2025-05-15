'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ShareProfile({ userId }: { userId: string }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [sharedWith, setSharedWith] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSharedViewers = async () => {
    const { data, error } = await supabase
      .from('profile_access')
      .select('viewer_id')
      .eq('profile_id', userId)

    if (!error && data) {
      setSharedWith(data.map((row) => row.viewer_id))
    }
  }

  useEffect(() => {
    fetchSharedViewers()
  }, [userId])

  const handleShare = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault?.()
    setMessage(null)
    setLoading(true)
console.log('Skickar delning:', { profile_id: userId, email })
    const response = await fetch('/api/share-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: userId, email }),
    })
console.log(response.text)
    if (response.ok) {
      setMessage('Delning skapad!')
      setEmail('')
      fetchSharedViewers()
    } else {
      const errorText = await response.text()
      setMessage(`Fel: ${errorText}`)
    }
    setLoading(false)
  }

  const handleUnshare = async (viewerId: string) => {
    const { error } = await supabase
      .from('profile_access')
      .delete()
      .eq('profile_id', userId)
      .eq('viewer_id', viewerId)

    if (!error) {
      setSharedWith((prev) => prev.filter((id) => id !== viewerId))
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">Dela med specifik användare</h3>

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleShare(e)}
          placeholder="E-postadress"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleShare}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Delar...' : 'Dela'}
        </button>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      {sharedWith.length > 0 && (
        <div className="text-sm space-y-1">
          <p className="font-medium">Delas med:</p>
          <ul className="list-disc pl-4">
            {sharedWith.map((id) => (
              <li key={id} className="flex items-center justify-between">
                <span className="truncate text-gray-700">{id}</span>
                <button
                  onClick={() => handleUnshare(id)}
                  className="text-red-600 text-xs hover:underline"
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
