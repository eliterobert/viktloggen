'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type WeightEntry = {
  id: string
  weight: number
  date: string
  public: boolean
}

export default function WeightList({ userId }: { userId: string }) {
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeights = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('weights')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setWeights(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchWeights()
  }, [userId])

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Radera denna viktpost?')
    if (!confirm) return

    const { error } = await supabase.from('weights').delete().eq('id', id)

    if (error) {
      alert('Fel vid radering: ' + error.message)
    } else {
      setWeights((prev) => prev.filter((w) => w.id !== id))
    }
  }

  if (loading) return <p className="text-center">Laddar viktdata...</p>
  if (error) return <p className="text-red-500 text-center">{error}</p>
  if (weights.length === 0) return <p className="text-center">Inga vikter inloggade ännu.</p>

  return (
    <div className="mt-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">Viktlista</h2>

      <ul className="space-y-2">
        {weights.map((entry) => (
          <li
            key={entry.id}
            className="p-3 border rounded bg-white shadow-sm text-sm flex justify-between items-start"
          >
            <div className="space-y-1">
              <p className="font-semibold">{entry.weight.toFixed(1)} kg</p>
              <p className="text-gray-600 text-xs">{entry.date}</p>
              {entry.public && (
                <span className="text-green-600 text-xs">Delad</span>
              )}
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
              className="text-red-600 text-xs hover:underline"
            >
              Radera
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
