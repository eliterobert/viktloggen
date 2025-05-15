// app/api/share-profile/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { profile_id, email } = body

  if (!profile_id || !email) {
    return new Response('Missing profile_id or email', { status: 400 })
  }

  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?email=${email}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
    }
  )

  if (!userRes.ok) {
    return new Response('Failed to fetch user', { status: 500 })
  }

 const userData: { users: { id: string; email: string }[] } = await userRes.json()

   const user = userData.users?.find((u) => u.email === email)

console.log('🧠 Hämta användare via e-post:', email)
console.log('🔍 Auth API svar:', userData)

console.log('✅ Vald användare:', user)
console.log('📥 Lägger till i profile_access:', {
  profile_id,
  viewer_id: user?.id
})
  if (!user?.id) {
    return new Response('User not found', { status: 404 })
  }

  const { error: insertError } = await supabase.from('profile_access').upsert({
    profile_id,
    viewer_id: user.id,
  })

  if (insertError) {
    return new Response('Failed to share profile', { status: 500 })
  }

  return new Response('Profile shared', { status: 200 })
}
