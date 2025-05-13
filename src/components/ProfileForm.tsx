'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../app/lib/supabase'

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
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  // Ladda profil + senaste vikt
  useEffect(() => {
    const loadProfile = async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, start_weight, goal_weight, public')
        .eq('id', userId)
        .single()

      if (profile) {
        setFirstName(profile.first_name || '')
        setLastName(profile.last_name || '')
        setStartWeight(profile.start_weight ?? null)
        setGoalWeight(profile.goal_weight ?? null)
        setIsPublic(profile.public ?? false)
      }

      const { data: weight, error: weightError } = await supabase
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

  // Beräkna % till mål
  let progress = null
  if (
    startWeight !== null &&
    latestWeight !== null &&
    goalWeight !== null &&
    startWeight > goalWeight
  ) {
    const totalToLose = startWeight - goalWeight
    const lost = startWeight - latestWeight
    progress = Math.min(100, Math.max(0, Math.round((lost / totalToLose) * 100)))
  }

  if (loading) return <p>Laddar profil...</p>

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-4">
      <h2 className="text-xl font-bold">Din profil</h2>

      {/* Namn */}
      <div>
        <label className="block text-sm font-medium">Förnamn</label>
        <input
          className="w-full p-2 border rounded"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Efternamn</label>
        <input
          className="w-full p-2 border rounded"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      {/* Viktmål */}
      <div>
        <label className="block text-sm font-medium">Startvikt (kg)</label>
        <input
          type="number"
          className="w-full p-2 border rounded"
          value={startWeight ?? ''}
          onChange={(e) => setStartWeight(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Målvikt (kg)</label>
        <input
          type="number"
          className="w-full p-2 border rounded"
          value={goalWeight ?? ''}
          onChange={(e) => setGoalWeight(parseFloat(e.target.value))}
        />
      </div>

      {/* Public profil */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        <label>Visa min profil offentligt</label>
      </div>

      {/* Info om vikt & mål */}
      {latestWeight !== null && (
        <p className="text-sm text-gray-600">
          Senast loggat: <strong>{latestWeight} kg</strong>
        </p>
      )}

      {progress !== null && (
        <div className="bg-gray-100 p-2 rounded">
          <p>
            Du har nått{' '}
            <span className="font-bold text-green-600">{progress}%</span> av ditt mål.
          </p>
        </div>
      )}

      <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
        Spara profil
      </button>

      {message && <p className="text-green-600">{message}</p>}
    </form>
  )
}
