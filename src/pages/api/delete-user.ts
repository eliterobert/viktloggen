// pages/api/delete-user.ts

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id } = req.body

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' })
  }

  const SUPABASE_URL = 'https://hafrrmbpayhkrdkwceln.supabase.co'
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  // 1. Radera weights
  await fetch(`${SUPABASE_URL}/rest/v1/weights?user_id=eq.${user_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      Prefer: 'return=minimal',
    },
  })

  // 2. Radera profile
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      Prefer: 'return=minimal',
    },
  })

  // 3. Radera användare från auth
  const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
  })

  if (!deleteRes.ok) {
    const errorText = await deleteRes.text()
    return res.status(500).json({ error: 'Failed to delete user from auth', details: errorText })
  }

  return res.status(200).json({ message: 'User and related data deleted' })
}
