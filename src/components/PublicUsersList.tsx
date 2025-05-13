'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type PublicUser = {
  id: string
  first_name: string
  last_name: string
  start_weight: number | null
  goal_weight: number | null
  stars: number
}

type LatestWeight = {
  user_id: string
  weight: number
}

export default function PublicUserList() {
  const [users, setUsers] = useState<PublicUser[]>([])
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      // Hämta offentliga profiler
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, start_weight, goal_weight, stars')
        .eq('public', true)

      // Hämta senaste vikt per användare
      const { data: allWeights } = await supabase
        .from('weights')
        .select('user_id, weight, date')
        .order('date', { ascending: false })

      // Gruppera senaste vikt per user_id
      const latestByUser: Record<string, number> = {}
      for (const entry of allWeights || []) {
        if (!latestByUser[entry.user_id]) {
          latestByUser[entry.user_id] = entry.weight
        }
      }

      setUsers(profiles || [])
      setWeights(latestByUser)
      setLoading(false)
    }

    load()
  }, [])

  const getMedal = (stars: number) => {
    if (stars >= 20) return '🏆 Legend'
    if (stars >= 15) return '🥇 Guld'
    if (stars >= 10) return '🥈 Silver'
    if (stars >= 5) return '🥉 Brons'
    return ''
  }

  const getProgress = (
    start: number | null,
    goal: number | null,
    current: number | null
  ): string => {
    if (start === null || goal === null || current === null) return '-'
    if (start <= goal) return '-'
    const progress = ((start - current) / (start - goal)) * 100
    return `${Math.min(100, Math.max(0, Math.round(progress)))}%`
  }

  if (loading) return <p className="text-center">Laddar användare...</p>

  return (
    <div className="max-w-md mx-auto mt-6 space-y-4">
      <h2 className="text-xl font-bold text-center">Andras framsteg</h2>

      {users.map((user) => {
        const latest = weights[user.id] ?? null
        const medal = getMedal(user.stars)
        const progress = getProgress(user.start_weight, user.goal_weight, latest)

        return (
          <div
            key={user.id}
            className="p-3 bg-white shadow rounded border text-sm space-y-1"
          >
            <p className="font-semibold">
              {user.first_name} {user.last_name}
            </p>
            {latest && <p>Senaste vikt: {latest.toFixed(1)} kg</p>}
            <p>Uppnått mål till: <strong>{progress}</strong></p>
            {medal && <p className="text-lg">{medal}</p>}
          </div>
        )
      })}
    </div>
  )
}
