'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function WeightForm({ userId }: { userId: string }) {
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-4 space-y-5 bg-white shadow rounded-md"
    >
      <h2 className="text-xl font-bold text-center">Registrera vikt</h2>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Vikt (kg)</label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full p-3 text-base border rounded"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 text-base border rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={() => setIsPublic(!isPublic)}
          id="public"
        />
        <label htmlFor="public" className="text-sm">
          Dela denna vikt med andra
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-base bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {loading ? 'Sparar...' : 'Spara vikt'}
      </button>

      {message && (
        <p className="text-center text-sm text-green-600">{message}</p>
      )}
    </form>
  )
}