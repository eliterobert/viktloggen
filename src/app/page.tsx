'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import WeightForm from '../components/WeightForm'
import WeightList from '../components/WeightList'
import NavMenu from '../components/NavMenu'
import MobileNav from '../components/MobileNav'
import { PageView } from '../types/navigation'
import ProfileForm from '../components/ProfileForm'
import PublicUsersList from '../components/PublicUsersList'
import { Smile } from 'lucide-react'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [view, setView] = useState<PageView>('log')
  const [profile, setProfile] = useState<{ first_name: string; last_name: string } | null>(null)

  useEffect(() => {
    // Hämta inloggningssession
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Hämta profilinformation
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single()

      if (!error && data) {
        setProfile({ first_name: data.first_name, last_name: data.last_name })
      }
    }

    fetchProfile()
  }, [session])

  return (
    <main className="p-4 max-w-xl mx-auto space-y-6">
      {!session ? (
        <Auth />
      ) : (
        <>
<div className="block sm:hidden">
  <MobileNav currentView={view} onChange={setView} />
</div>
<div className="hidden sm:block">
  <NavMenu currentView={view} onChange={setView} />
</div>
    <div className="pt-4 space-y-6">
      <div className="flex justify-between items-center"></div>
<h1 className="text-lg sm:text-xl font-semibold text-center truncate">
   Välkommen {profile?.first_name} 👋
</h1>
      {view === 'log' && <WeightForm userId={session.user.id} />}
      {view === 'list' && <WeightList userId={session.user.id} />}
{view === 'profile' && (
  <ProfileForm
    userId={session.user.id}
    onProfileUpdate={(updated) => setProfile(updated)}
  />
)}
{view === 'users' && <PublicUsersList />}
    </div>
  </>
)}
    </main>
  )
}