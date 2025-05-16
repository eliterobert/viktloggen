'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ShareProfile from './ShareProfile'

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
      } else {
        setProfile({
          first_name: '',
          last_name: '',
          start_weight: 0,
          goal_weight: 0,
          stars: 0,
          public: false,
        })
      }

      setLoading(false)
    }

    fetchProfile()
  }, [userId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setProfile((prev) =>
      prev ? { ...prev, [name]: type === 'checkbox' ? checked : value } : null
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    const updates = {
      id: userId,
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      start_weight: Number(profile?.start_weight) || 0,
      goal_weight: Number(profile?.goal_weight) || 0,
      public: profile?.public ?? false,
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (!error) {
      setMessage('✅ Profil sparad!')
      onProfileUpdate?.(updates)
    } else {
      setMessage('❌ Kunde inte spara profilen.')
    }

    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Är du säker på att du vill radera ditt konto och all data?")
    if (!confirmed) return

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      alert("Fel: kunde inte hämta användare.")
      return
    }

    const response = await fetch("/api/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    })

    if (response.ok) {
      await supabase.auth.signOut()
      window.location.reload()
    } else {
      const errorText = await response.text()
      alert("Kunde inte ta bort konto: " + errorText)
    }
  }

  if (loading) return <p className="text-center">Laddar profil...</p>

  const lost = profile?.start_weight && profile?.goal_weight
    ? profile.start_weight - profile.goal_weight
    : 0

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-6 space-y-6 bg-white shadow-lg rounded-2xl"
    >
      <h2 className="text-2xl font-bold text-center text-purple-800 flex items-center justify-center gap-2">
        <span>👤</span> Din profil
      </h2>

      {/* Namn */}
      <div className="flex gap-4">
        <div className="w-1/2">
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">Förnamn</label>
          <input
            id="first_name"
            type="text"
            name="first_name"
            placeholder="Förnamn"
            value={profile?.first_name || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="w-1/2">
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Efternamn</label>
          <input
            id="last_name"
            type="text"
            name="last_name"
            placeholder="Efternamn"
            value={profile?.last_name || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      {/* Vikt */}
      <div className="flex gap-4">
        <div className="w-1/2">
          <label htmlFor="start_weight" className="block text-sm font-medium text-gray-700 mb-1">Startvikt (kg)</label>
          <input
            id="start_weight"
            type="number"
            name="start_weight"
            placeholder="Startvikt"
            value={profile?.start_weight || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="w-1/2">
          <label htmlFor="goal_weight" className="block text-sm font-medium text-gray-700 mb-1">Målvikt (kg)</label>
          <input
            id="goal_weight"
            type="number"
            name="goal_weight"
            placeholder="Målvikt"
            value={profile?.goal_weight || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      {/* Offentlig */}
      <div className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          id="public"
          name="public"
          checked={!!profile?.public}
          onChange={handleChange}
        />
        <label htmlFor="public">Dela mina vikter offentligt</label>
      </div>

      {/* Info */}
      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 space-y-1">
        <p>⭐ Du har <strong>{profile?.stars ?? 0}</strong> stjärnor</p>
        <p>🎯 Du har <strong>{Math.max(0, lost).toFixed(1)} kg</strong> kvar till målet</p>
      </div>


      <ShareProfile userId={userId} />

      {/* Knappar */}
      <div className="space-y-3">
        <button
          type="submit"
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md transition"
        >
          💾 Spara profil
        </button>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md"
        >
          🗑 Radera konto och all data
        </button>
      </div>

      {message && (
        <p className="text-center text-sm text-amber-600 font-medium">{message}</p>
      )}
    </form>
  )
}
