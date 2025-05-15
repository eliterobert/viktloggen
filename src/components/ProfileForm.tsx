'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Profile {
  first_name: string
  last_name: string
  start_weight: number
  goal_weight: number
  stars: number
  public: boolean
}

export default function ProfileForm({
  userId,
  onProfileUpdate,
}: {
  userId: string
  onProfileUpdate?: (profile: Partial<Profile>) => void
}) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [userId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    const updates = {
      first_name: profile?.first_name,
      last_name: profile?.last_name,
      start_weight: Number(profile?.start_weight),
      goal_weight: Number(profile?.goal_weight),
      public: profile?.public ?? false,
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (!error) {
      setMessage('Profil uppdaterad!')
      onProfileUpdate?.(updates)
    } else {
      setMessage('Kunde inte uppdatera profilen.')
    }

    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Är du säker på att du vill radera ditt konto och all data?')
    if (!confirmed) return

    try {
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      if (response.ok) {
        alert('Ditt konto har raderats.')
        await supabase.auth.signOut()
        window.location.reload()
      } else {
        const errorText = await response.text()
        alert('Kunde inte radera konto: ' + errorText)
      }
    } catch (err) {
      alert('Ett fel uppstod.')
      console.error(err)
    }
  }

  if (loading || !profile) return <p>Laddar profil...</p>

  const lost = profile.start_weight - profile.goal_weight
  const progress =
    profile.start_weight && lost > 0
      ? Math.max(0, Math.min(100, ((profile.start_weight - profile.goal_weight) / lost) * 100))
      : 0

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-4 space-y-5 bg-white shadow rounded-md"
    >
      <h2 className="text-xl font-bold text-center">Din profil</h2>

<div className="flex gap-2">
  <div className="w-1/2 space-y-1">
    <label className="text-sm font-medium">Förnamn</label>
    <input
      type="text"
      name="first_name"
      value={profile.first_name ?? ''}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>

  <div className="w-1/2 space-y-1">
    <label className="text-sm font-medium">Efternamn</label>
    <input
      type="text"
      name="last_name"
      value={profile.last_name ?? ''}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>
</div>

<div className="flex gap-2">
  <div className="w-1/2 space-y-1">
    <label className="text-sm font-medium">Startvikt</label>
    <input
      type="number"
      name="start_weight"
      value={profile.start_weight ?? ''}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>

  <div className="w-1/2 space-y-1">
    <label className="text-sm font-medium">Målvikt</label>
    <input
      type="number"
      name="goal_weight"
      value={profile.goal_weight ?? ''}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />
  </div>
</div>

      <div className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          id="public"
          checked={!!profile.public}
          onChange={(e) =>
            setProfile((prev) => (prev ? { ...prev, public: e.target.checked } : prev))
          }
        />
        <label htmlFor="public">Dela mina vikter offentligt</label>
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        <p>⭐️ Du har {profile.stars} stjärnor</p>
        <p>
          🎯 Du har {Math.max(0, profile.start_weight - profile.goal_weight).toFixed(1)} kg kvar
          till målet
        </p>
      </div>

      <button
        type="submit"
        className="w-full py-3 text-base bg-amber-500 text-white rounded hover:bg-amber-600 transition"
      >
        {loading ? 'Sparar...' : 'Spara profil'}
      </button>

      <button
        onClick={handleDeleteAccount}
        type="button"
        className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow transition"
      >
        🗑 Radera konto och all data
      </button>

      {message && (
        <div className="text-center text-sm text-amber-600 font-medium">{message}</div>
      )}
    </form>
  )
}
