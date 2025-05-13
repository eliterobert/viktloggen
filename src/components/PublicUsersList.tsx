'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type UserProfile = {
  id: string
  first_name: string
  last_name: string
  start_weight: number
  goal_weight: number
  latest_weight: number | null
}

export default function PublicUsersList() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      // Hämta delade profiler
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, start_weight, goal_weight')
        .eq('public', true)

      if (!profiles || error) return setLoading(false)

      // Hämta senaste vikt för varje användare
      const userData: UserProfile[] = await Promise.all(
        profiles.map(async (profile: any) => {
          const { data: weight } = await supabase
            .from('weights')
            .select('weight')
            .eq('user_id', profile.id)
            .order('date', { ascending: false })
            .limit(1)
            .single()

          return {
            ...profile,
            latest_weight: weight?.weight ?? null,
          }
        })
      )

      setUsers(userData)
      setLoading(false)
    }

    fetchUsers()
  }, [])

  if (loading) return <p>Laddar användare...</p>

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-bold">Delade profiler</h2>
      <ul className="space-y-3">
        {users.map((u) => {
          const diffKg =
            u.latest_weight !== null ? u.latest_weight - u.goal_weight : null
          const totalKg =
            u.start_weight !== null ? u.start_weight - u.goal_weight : null
          const progress =
            diffKg !== null && totalKg !== null && totalKg > 0
              ? Math.min(100, Math.round(((totalKg - diffKg) / totalKg) * 100))
              : null

          return (
            <li key={u.id} className="p-3 border rounded bg-white shadow-sm">
              <p className="font-semibold">
                {u.first_name} {u.last_name}
              </p>
              {u.latest_weight !== null && u.goal_weight !== null && (
                <p className="text-sm">
                  Senast loggat: {u.latest_weight} kg – mål: {u.goal_weight} kg
                </p>
              )}
              {diffKg !== null && progress !== null && (
                <p className="text-sm text-green-700">
                  {Math.max(0, diffKg).toFixed(1)} kg kvar (
                  {progress}% mot målet)
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
