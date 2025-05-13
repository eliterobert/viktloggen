'use client'

import { useState } from 'react'
import { supabase } from '../app/lib/supabase'

export default function WeightForm({ userId }: { userId: string }) {
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // YYYY-MM-DD
  const [isPublic, setIsPublic] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.from('weights').insert({
      user_id: userId,
      weight: parseFloat(weight),
      date,
      public: isPublic,
    })

    if (error) {
      setMessage(`Fel: ${error.message}`)
    } else {
      setMessage('Vikt registrerad!')
      setWeight('')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Registrera vikt</h2>

      <div>
        <label className="block text-sm font-medium">Vikt (kg)</label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={() => setIsPublic(!isPublic)}
        />
        <label>Dela denna vikt med andra</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        {loading ? 'Sparar...' : 'Spara vikt'}
      </button>

      {message && <p className="text-center text-sm">{message}</p>}
    </form>
  )
}
