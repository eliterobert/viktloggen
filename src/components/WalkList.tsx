'use client'

import type { Walk } from './WalkForm'

export default function WalkList({ walks, onDelete }: { walks: Walk[], onDelete: (id: string) => void }) {
    if (!walks || walks.length === 0) return <p className="text-center">Inga promenader ännu.</p>

    return (
        <div className="w-full max-w-md mx-auto space-y-4 mt-4">
            <h2 className="text-xl font-bold text-center">Tidigare promenader</h2>
            {walks.map((walk) => (
                <div key={walk.id} className="p-4 border rounded shadow-sm bg-white">

                    <div className="flex justify-between text-sm text-gray-700">
                        <span>📅 {new Date(walk.date).toLocaleDateString('sv-SE')}</span>
                        <span>🚶‍♂️ {walk.distance_km} km</span>
                    </div>
                    <button
                        onClick={() => onDelete(walk.id)}
                        className="text-sm text-red-600 hover:underline float-right"
                    >
                        🗑 Ta bort
                    </button>
                    {walk.duration_min !== null && (
                        <p className="text-sm text-gray-600 mt-1">🕒 {walk.duration_min} min</p>
                    )}
                    {walk.note && (
                        <p className="text-sm text-gray-500 mt-1 italic">💬 {walk.note}</p>
                    )}
                </div>
            ))}
        </div>
    )
}