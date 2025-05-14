'use client'

import { supabase } from '../lib/supabase'
import { Home, User, PlusCircle, List, LogOut, Users } from 'lucide-react'

type PageView = 'log' | 'list' | 'profile' | 'users'

export default function NavMenu({
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
    <nav className="hidden sm:block w-full max-w-xs mx-auto py-4">
      <ul className="space-y-2">
        {navItems.map(({ view, label, icon: Icon }) => (
          <li key={view}>
            <button
              onClick={() => onChange(view)}
              className={`flex items-center gap-2 w-full p-2 rounded-md transition ${
                currentView === view
                  ? 'bg-amber-100 text-amber-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            <LogOut size={20} />
            <span>Logga ut</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
