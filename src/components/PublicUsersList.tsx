'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface PublicUser {
  id: string
  first_name: string
  last_name: string
  stars: number
  latest_weight?: number
  latest_date?: string
}

export default function PublicUsersList() {
  const [users, setUsers] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsersWithWeights = async () => {
      // Steg 1: hämta alla profiler där public = true
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, stars')
        .eq('public', true)

      if (error || !profiles) {
        console.error('Kunde inte hämta profiler:', error)
        setLoading(false)
        return
      }

      const userData: PublicUser[] = []

      for (const profile of profiles) {
        const { data: weights } = await supabase
          .from('weights')
          .select('weight, date')
          .eq('user_id', profile.id)
          .order('date', { ascending: false })
          .limit(1)

        userData.push({
          ...profile,
          latest_weight: weights?.[0]?.weight ?? undefined,
          latest_date: weights?.[0]?.date ?? undefined,
        })
      }

      // Visa bara användare som har minst en vikt
      setUsers(userData.filter((u) => u.latest_weight !== undefined))
      setLoading(false)
    }

    fetchUsersWithWeights()
  }, [])

  if (loading) return <p className="text-center text-gray-600">Laddar användare...</p>

  if (users.length === 0) {
    return <p className="text-center text-sm text-gray-500">Inga användare har delat sina vikter än.</p>
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 bg-white shadow rounded-md">
      <h2 className="text-xl font-bold text-center">Andras framsteg</h2>
      <ul className="space-y-3">
        {users.map((user) => (
          <li key={user.id} className="border-b pb-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{user.first_name} {user.last_name}</p>
                <p className="text-sm text-gray-600">
                  ⭐ {user.stars} stjärnor
                  {user.latest_date && (
                    <>
                      <br />
                      📉 Senast loggad vikt: <strong>{user.latest_weight} kg</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}