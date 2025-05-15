// WalkForm.tsx
'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Walk {
  id: string
  date: string
  distance_km: number
  duration_min: number | null
  note: string | null
}

export default function WalkForm({
  userId,
  onNewWalk,
}: {
  userId: string
  onNewWalk: (walk: Walk) => void
}) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    const distance_km = parseFloat(distance)
    const duration_min = duration ? parseInt(duration) : null

    if (isNaN(distance_km) || distance_km <= 0) {
      setMessage('Ange giltig sträcka (km)')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('walks')
      .insert([{ user_id: userId, date, distance_km, duration_min, note }])
      .select()
      .single()

    if (error || !data) {
      setMessage(`Fel: ${error?.message || 'Ingen data'}`)
    } else {
      onNewWalk(data)
      setMessage('Promenad loggad ✅')
      setDistance('')
      setDuration('')
      setNote('')
    }

    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-4 space-y-5 bg-white shadow rounded-md"
    >
      <h2 className="text-xl font-bold text-center">Logga promenad</h2>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 text-base border rounded"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Sträcka (km)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="w-full p-3 text-base border rounded"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Tid (minuter)</label>
        <input
          type="number"
          step="1"
          min="0"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full p-3 text-base border rounded"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Anteckning (valfri)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-3 text-base border rounded"
          rows={2}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-base bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
      >
        {loading ? 'Sparar...' : 'Spara promenad'}
      </button>

      {message && (
        <div className="text-center text-sm text-emerald-600 font-medium">
          {message}
        </div>
      )}
    </form>
  )
}
