'use client'

import { supabase } from '../lib/supabase'
import { PageView } from '../types/navigation'
export default function NavMenu({
  currentView,
  onChange,
}: {
  currentView: PageView
  onChange: (view: PageView) => void
}) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm px-2 py-2">
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start max-w-screen-md mx-auto">
        {[
          { label: 'Logga vikt', value: 'log' },
          { label: 'Viktlista', value: 'list' },
          { label: 'Profil', value: 'profile' },
          { label: 'Alla användare', value: 'users' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => onChange(item.value as PageView)}
            className={`px-4 py-2 rounded text-sm ${
              currentView === item.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {item.label}
          </button>
        ))}

        {/* Logga ut-knapp */}
        <button
          onClick={handleLogout}
          className="ml-auto px-4 py-2 rounded text-sm bg-red-500 text-white hover:bg-red-600"
        >
          Logga ut
        </button>
      </div>
    </nav>
  )
}
