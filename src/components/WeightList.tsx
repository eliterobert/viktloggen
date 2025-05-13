'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../app/lib/supabase'

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
    const confirm = window.confirm('Är du säker på att du vill radera denna viktpost?')
    if (!confirm) return

    const { error } = await supabase.from('weights').delete().eq('id', id)

    if (error) {
      alert('Kunde inte radera posten: ' + error.message)
    } else {
      setWeights((prev) => prev.filter((w) => w.id !== id))
    }
  }

  if (loading) return <p>Laddar viktdata...</p>
  if (error) return <p className="text-red-500">Fel: {error}</p>
  if (weights.length === 0) return <p>Inga viktinlägg ännu.</p>

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-bold">Dina viktinlägg</h2>
      <ul className="space-y-2">
        {weights.map((entry) => (
          <li
            key={entry.id}
            className="p-3 border rounded bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <div>
                <strong>{entry.weight} kg</strong> – {entry.date}
              </div>
              {entry.public && (
                <span className="text-sm text-green-600 font-medium">Delad</span>
              )}
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
              className="text-red-600 text-sm hover:underline"
            >
              Radera
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}