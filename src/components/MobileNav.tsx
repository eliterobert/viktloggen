'use client'

import {
  Home,
  ListOrdered,
  User,
  Users,
  LogOut,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { PageView } from '../types/navigation'

export default function MobileNav({
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

  const items = [
    { icon: Home, label: 'Logga', view: 'log' },
    { icon: ListOrdered, label: 'Lista', view: 'list' },
    { icon: User, label: 'Profil', view: 'profile' },
    { icon: Users, label: 'Användare', view: 'users' },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t shadow sm:hidden">
      <div className="flex justify-around items-center py-2">
        {items.map(({ icon: Icon, label, view }) => (
          <button
            key={view}
            onClick={() => onChange(view as PageView)}
            className={`flex flex-col items-center text-xs ${
              currentView === view ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-xs text-red-600"
        >
          <LogOut size={22} />
          <span>Logga ut</span>
        </button>
      </div>
    </nav>
  )
}