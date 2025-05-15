'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import WeightForm from '../components/WeightForm'
import WeightList from '../components/WeightList'
import NavMenu from '../components/NavMenu'
import MobileNav from '../components/MobileNav'
import ProfileForm from '../components/ProfileForm'
import PublicUsersList from '../components/PublicUsersList'

type PageView = 'log' | 'list' | 'profile' | 'users'

interface Profile {
  first_name: string
  last_name: string
  start_weight: number
  goal_weight: number
  stars: number
  public: boolean
}

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [view, setView] = useState<PageView>('log')

  // ✅ Typen är nu Partial<Profile> | null – för att matcha uppdateringar
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    getSession()

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single()

      if (!error && data) {
        setProfile({
          first_name: data.first_name,
          last_name: data.last_name,
        })
      }
    }

    fetchProfile()
  }, [session])

  if (!session) {
    return (
      <main className="p-4 max-w-xl mx-auto">
        <Auth />
      </main>
    )
  }

  return (
    <main className="p-4 max-w-xl mx-auto space-y-6">
      <div className="block sm:hidden">
        <MobileNav currentView={view} onChange={setView} />
      </div>
      <div className="hidden sm:block">
        <NavMenu currentView={view} onChange={setView} />
      </div>

      <div className="pt-4 space-y-6">
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
    </main>
  )
}
