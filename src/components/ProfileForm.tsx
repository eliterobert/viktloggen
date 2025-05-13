'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileForm({
  userId,
  onProfileUpdate,
}: {
  userId: string
  onProfileUpdate?: (profile: { first_name: string; last_name: string }) => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [startWeight, setStartWeight] = useState<number | null>(null)
  const [goalWeight, setGoalWeight] = useState<number | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [latestWeight, setLatestWeight] = useState<number | null>(null)
  const [stars, setStars] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, start_weight, goal_weight, public, stars')
        .eq('id', userId)
        .single()

      if (profile) {
        setFirstName(profile.first_name || '')
        setLastName(profile.last_name || '')
        setStartWeight(profile.start_weight ?? null)
        setGoalWeight(profile.goal_weight ?? null)
        setIsPublic(profile.public ?? false)
        setStars(profile.stars ?? 0)
      }

      const { data: weight } = await supabase
        .from('weights')
        .select('weight')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (weight) {
        setLatestWeight(weight.weight)
      }

      setLoading(false)
    }

    loadProfile()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      start_weight: startWeight,
      goal_weight: goalWeight,
      public: isPublic,
    })

    if (error) {
      setMessage('Kunde inte spara: ' + error.message)
    } else {
      setMessage('Profil uppdaterad!')
      if (onProfileUpdate) {
        onProfileUpdate({ first_name: firstName, last_name: lastName })
      }
    }
  }

  const progress =
    startWeight !== null &&
    latestWeight !== null &&
    goalWeight !== null &&
    startWeight > goalWeight
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(((startWeight - latestWeight) / (startWeight - goalWeight)) * 100)
          )
        )
      : null

  const renderStars = (count: number) =>
    '⭐'.repeat(count).padEnd(5, '☆') // max 5 synliga (valfritt)

  if (loading) return <p className="text-center">Laddar profil...</p>

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-4 space-y-5 bg-white shadow rounded-md"
    >
      <h2 className="text-xl font-bold text-center">Din profil</h2>

      {/* Namn */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">Förnamn</label>
        <input
          className="w-full p-3 text-base border rounded"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Efternamn</label>
        <input
          className="w-full p-3 text-base border rounded"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      {/* Viktmål */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">Startvikt (kg)</label>
        <input
          type="number"
          className="w-full p-3 text-base border rounded"
          value={startWeight ?? ''}
          onChange={(e) => setStartWeight(parseFloat(e.target.value))}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Målvikt (kg)</label>
        <input
          type="number"
          className="w-full p-3 text-base border rounded"
          value={goalWeight ?? ''}
          onChange={(e) => setGoalWeight(parseFloat(e.target.value))}
        />
      </div>

      {/* Offentlig profil */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          id="public"
        />
        <label htmlFor="public" className="text-sm">
          Visa min profil offentligt
        </label>
      </div>

      {/* Info */}
      {latestWeight !== null && (
        <p className="text-sm text-gray-600">
          Senast loggad vikt: <strong>{latestWeight} kg</strong>
        </p>
      )}

      {progress !== null && (
        <div className="bg-gray-100 p-3 rounded text-sm text-center">
          Du har nått{' '}
          <span className="font-bold text-green-600">{progress}%</span> av ditt mål.
        </div>
      )}

{stars !== null && (
  <div className="bg-yellow-50 p-3 rounded text-sm text-center space-y-2">
    <div>
      🌟 Du har samlat <strong>{stars}</strong> stjärna{stars === 1 ? '' : 'r'}!
    </div>
    <div className="text-xl">{renderStars(Math.min(stars, 5))}</div>

    {/* Medaljer */}
    <div className="pt-2">
      {stars >= 20 && <div className="text-2xl">🏆 Legend</div>}
      {stars >= 15 && <div className="text-2xl">🥇 Guld</div>}
      {stars >= 10 && <div className="text-2xl">🥈 Silver</div>}
      {stars >= 5 && <div className="text-2xl">🥉 Brons</div>}
    </div>
  </div>
)}

      {/* Spara */}
      <button
        type="submit"
        className="w-full py-3 text-base bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Spara profil
      </button>

      {message && <p className="text-green-600 text-sm text-center">{message}</p>}
    </form>
  )
}
