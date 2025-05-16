'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type SharedUser = {
  id: string
  email: string
}

export default function ShareProfile({ userId }: { userId: string }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [sharedWith, setSharedWith] = useState<SharedUser[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSharedViewers = async () => {
    const { data: accessData, error: accessError } = await supabase
      .from('profile_access')
      .select('viewer_id')
      .eq('profile_id', userId)

    if (accessError || !accessData) return

    const viewerIds = accessData.map((row) => row.viewer_id)

    if (viewerIds.length === 0) {
      setSharedWith([])
      return
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', viewerIds)

    if (profileError || !profiles) return

    setSharedWith(profiles)
  }

  useEffect(() => {
    fetchSharedViewers()
  }, [userId])

  const handleShare = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault?.()
    setMessage(null)
    setLoading(true)

    const response = await fetch('/api/share-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: userId, email }),
    })

    if (response.ok) {
      setMessage('✅ Delning skapad!')
      setEmail('')
      fetchSharedViewers()
    } else {
      const errorText = await response.text()
      setMessage(`❌ Fel: ${errorText}`)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <label className="font-semibold text-sm flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M13.828 10.172a4 4 0 015.657 0l1.415 1.414a4 4 0 010 5.657l-3.536 3.536a4 4 0 01-5.657 0l-1.414-1.414M10.172 13.828a4 4 0 01-5.657 0l-1.415-1.414a4 4 0 010-5.657l3.536-3.536a4 4 0 015.657 0l1.414 1.414" />
        </svg>
        Dela din profil
      </label>

      <div className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleShare(e)}
          placeholder="E-postadress"
          className="flex-1 rounded-l-md border border-gray-300 p-2 text-sm"
        />
        <button
          onClick={handleShare}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-md text-sm transition"
        >
          {loading ? 'Delar...' : 'Dela'}
        </button>
      </div>

      {message && (
        <p className="text-sm text-gray-700">{message}</p>
      )}

      {sharedWith.length > 0 && (
        <div className="text-sm space-y-1">
          <p className="font-medium text-gray-800">🔒 Delas med:</p>
          <ul className="list-disc pl-4 space-y-1">
            {sharedWith.map((user) => (
              <li key={`${user.id}-${user.email}`} className="text-gray-600">
                {user.email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
