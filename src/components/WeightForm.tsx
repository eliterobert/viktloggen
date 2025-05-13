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

    const newWeight = parseFloat(weight)

    // 1. Spara viktpost
    const { error } = await supabase.from('weights').insert({
      user_id: userId,
      weight: newWeight,
      date,
      public: isPublic,
    })

    if (error) {
      setMessage(`Fel: ${error.message}`)
      setLoading(false)
      return
    }

    // 2. Hämta tidigare vikt (för jämförelse)
    const { data: previous } = await supabase
      .from('weights')
      .select('weight, date')
      .eq('user_id', userId)
      .lt('date', date)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    const prevWeight = previous?.weight ?? null
    const lost = prevWeight !== null ? prevWeight - newWeight : 0

    // 3. Ge peppande feedback
    let feedback = 'Vikt registrerad!'
    if (lost > 0.4) {
      if (lost >= 3) feedback = `🥳 Superstjärna! Du har tappat ${lost.toFixed(1)} kg!`
      else if (lost >= 1.5) feedback = `🌟 Wow! ${lost.toFixed(1)} kg ner – det här går ju galant!`
      else if (lost >= 1) feedback = `🏃‍♂️ Du är på gång! -${lost.toFixed(1)} kg, starkt!`
      else feedback = `💪 Bra jobbat! Ett halvt kilo bort!`
    } else if (lost < 0) {
      feedback = '📈 Vikten har gått upp lite – ny dag, nya tag 💪'
    } else {
      feedback = '👍 Du håller koll – det är det viktigaste!'
    }

    // 4. Uppdatera stjärnor om vikten gått ner tillräckligt
    const { data: profile } = await supabase
      .from('profiles')
      .select('start_weight, stars')
      .eq('id', userId)
      .single()

    const startWeight = profile?.start_weight
    const currentStars = profile?.stars ?? 0

    if (startWeight && newWeight < startWeight) {
      const totalLost = startWeight - newWeight
      const calculatedStars = Math.floor(totalLost / 1.5)

      if (calculatedStars > currentStars) {
        const newStars = calculatedStars

        await supabase
          .from('profiles')
          .update({ stars: newStars })
          .eq('id', userId)

        feedback += ` 🎉 Du har nu ${newStars} ⭐️!`
      }
    }

    // 5. Rensa formulär och visa feedback
    setMessage(feedback)
    setWeight('')
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-4 space-y-5 bg-white shadow rounded-md"
    >
      <h2 className="text-xl font-bold text-center">Logga vikt</h2>

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
        <div className="text-center text-sm text-green-700 font-medium">
          {message}
        </div>
      )}
    </form>
  )
}
