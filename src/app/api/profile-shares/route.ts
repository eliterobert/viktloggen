import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const profile_id = url.searchParams.get('profile_id')

  if (!profile_id) {
    return NextResponse.json({ error: 'profile_id saknas' }, { status: 400 })
  }

  const { data: accessData, error: accessError } = await supabase
    .from('profile_access')
    .select('viewer_id')
    .eq('profile_id', profile_id)

  if (accessError) {
    return NextResponse.json({ error: 'Kunde inte hämta delningar' }, { status: 500 })
  }

  if (!accessData || accessData.length === 0) {
    return NextResponse.json({ sharedUsers: [] })
  }

  const viewerIds = accessData.map((row) => row.viewer_id)

  // Hämta e-post från auth.users (server-side)
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()

  if (userError) {
    return NextResponse.json({ error: 'Kunde inte hämta användare' }, { status: 500 })
  }

  const filteredUsers = users.users
    .filter((user) => viewerIds.includes(user.id))
    .map((user) => ({ id: user.id, email: user.email ?? '(okänd epost)' }))

  return NextResponse.json({ sharedUsers: filteredUsers })
}
