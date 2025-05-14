'use client'

import { supabase } from '../lib/supabase'
import { Home, User, PlusCircle, List, Users } from 'lucide-react'

type PageView = 'log' | 'list' | 'profile' | 'users'

export default function MobileNav({
  currentView,
  onChange,
}: {
  currentView: PageView
  onChange: (view: PageView) => void
}) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navItems: { view: PageView; label: string; icon: React.ElementType }[] = [
    { view: 'log', label: 'Logga', icon: PlusCircle },
    { view: 'list', label: 'Viktlista', icon: List },
    { view: 'profile', label: 'Profil', icon: User },
    { view: 'users', label: 'Användare', icon: Users },
  ]

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t shadow z-50">
      <ul className="flex justify-around items-center text-xs">
        {navItems.map(({ view, label, icon: Icon }) => (
          <li key={view}>
            <button
              onClick={() => onChange(view)}
              className={`flex flex-col items-center py-2 px-1 ${
                currentView === view ? 'text-amber-600 font-semibold' : 'text-gray-500'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="text-center py-2 border-t">
        <button
          onClick={handleLogout}
          className="text-sm text-red-600"
        >
          Logga ut
        </button>
      </div>
    </div>
  )
}
