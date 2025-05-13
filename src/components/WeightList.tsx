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
  const [startWeight, setStartWeight] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const [{ data: weightData, error: weightError }, { data: profileData }] =
        await Promise.all([
          supabase
            .from('weights')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false }),
          supabase
            .from('profiles')
            .select('start_weight')
            .eq('id', userId)
            .single(),
        ])

      if (weightError) {
        setError(weightError.message)
      } else {
        setWeights(weightData || [])
      }

      if (profileData?.start_weight !== undefined) {
        setStartWeight(profileData.start_weight)
      }

      setLoading(false)
    }

    fetchData()
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

  if (loading) return <p className="text-center">Laddar...</p>
  if (error) return <p className="text-red-600 text-center">{error}</p>
  if (weights.length === 0) return <p className="text-center">Du har inte loggat någon vikt än.</p>

  const latestWeight = weights[0]?.weight ?? null
  const totalLost =
    startWeight !== null && latestWeight !== null
      ? startWeight - latestWeight
      : null

  return (
    <div className="mt-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">Min viktresa</h2>

      <div className="bg-gray-100 p-4 rounded text-sm text-center space-y-1">
        {startWeight !== null && (
          <p>
            <strong>Startvikt:</strong> {startWeight.toFixed(1)} kg
          </p>
        )}
        {totalLost !== null && (
          <p>
            <strong>Gått ner:</strong>{' '}
            <span className="text-green-700 font-bold">
              {totalLost > 0 ? totalLost.toFixed(1) : '0.0'} kg
            </span>
          </p>
        )}
      </div>

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
