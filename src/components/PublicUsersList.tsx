'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface PublicUser {
  id: string
  first_name: string
  last_name: string
  stars: number
  start_weight?: number
  latest_weight?: number
  latest_weight_date?: string
  latest_walk_km?: number
  latest_walk_date?: string
  total_walk_km?: number
  total_lost_kg?: number
}

export default function PublicUsersList() {
  const [users, setUsers] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublicUsers = async () => {
      // 1. Hämta alla publika profiler
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, stars, start_weight')
        .eq('public', true)

      if (error || !profiles) return setLoading(false)

      const enrichedUsers: PublicUser[] = []

      for (const profile of profiles) {
        const userId = profile.id

        // Hämta senaste vikt
        const { data: weight } = await supabase
          .from('weights')
          .select('weight, date')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(1)
          .single()

        // Hämta senaste promenad
        const { data: latestWalk } = await supabase
          .from('walks')
          .select('distance_km, date')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(1)
          .single()

        // Hämta total sträcka
        const { data: totalWalk } = await supabase
          .from('walks')
          .select('distance_km')
          .eq('user_id', userId)

        const totalKm = totalWalk?.reduce((sum, w) => sum + (w.distance_km || 0), 0) || 0

        const totalLost = profile.start_weight && weight?.weight
          ? Math.max(0, profile.start_weight - weight.weight)
          : 0

        enrichedUsers.push({
          id: userId,
          first_name: profile.first_name,
          last_name: profile.last_name,
          stars: profile.stars,
          start_weight: profile.start_weight,
          latest_weight: weight?.weight,
          latest_weight_date: weight?.date,
          latest_walk_km: latestWalk?.distance_km,
          latest_walk_date: latestWalk?.date,
          total_walk_km: totalKm,
          total_lost_kg: totalLost,
        })
      }

      setUsers(enrichedUsers)
      setLoading(false)
    }

    fetchPublicUsers()
  }, [])

  if (loading) return <p className="text-center">Laddar användare...</p>
  if (users.length === 0) return <p className="text-center">Inga användare delar sin data.</p>

  return (
    <div className="w-full max-w-md mx-auto space-y-4 mt-4">
      <h2 className="text-xl font-bold text-center">Användare som delar sin data</h2>
      {users.map((user) => (
        <div key={user.id} className="p-4 bg-white shadow rounded space-y-1">
          <p className="font-semibold text-gray-800">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-sm text-gray-600">⭐ {user.stars} stjärnor</p>
          {user.latest_weight && (
            <p className="text-sm text-gray-600">
              ⚖️ {user.latest_weight} kg ({new Date(user.latest_weight_date!).toLocaleDateString('sv-SE')})
            </p>
          )}
          {user.total_lost_kg !== undefined && (
            <p className="text-sm text-green-600">
              🟢 Gått ner {user.total_lost_kg.toFixed(1)} kg totalt
            </p>
          )}
          {user.latest_walk_km && (
            <p className="text-sm text-gray-600">
              🚶‍♀️ {user.latest_walk_km} km ({new Date(user.latest_walk_date!).toLocaleDateString('sv-SE')})
            </p>
          )}
          <p className="text-sm text-blue-600">
            🔵 Totalt gått: {user.total_walk_km?.toFixed(1)} km
          </p>
        </div>
      ))}
    </div>
  )
}
