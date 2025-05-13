export type PageView = 'log' | 'list' | 'profile' | 'users'
import { supabase } from '../app/lib/supabase'
export default function NavMenu({
  currentView,
  onChange,
}: {
  currentView: PageView
  onChange: (view: PageView) => void
}) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm flex space-x-4 px-4 py-2">
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'log' ? 'bg-blue-500 text-white' : 'bg-gray-100'
        }`}
        onClick={() => onChange('log')}
      >
        Logga vikt
      </button>
      <button
        className={`px-4 py-2 rounded ${
          currentView === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100'
        }`}
        onClick={() => onChange('list')}
      >
        Viktlista
      </button>
      <button
  className={`px-4 py-2 rounded ${
    currentView === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-100'
  }`}
  onClick={() => onChange('profile')}
>
  Profil
</button>
<button
  className={`px-4 py-2 rounded ${
    currentView === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-100'
  }`}
  onClick={() => onChange('users')}
>
  Alla användare
</button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => supabase.auth.signOut()}
        >
          Logga ut
        </button>
    </nav>
  )
}