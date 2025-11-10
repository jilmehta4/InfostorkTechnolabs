const BASE = import.meta.env.VITE_API_BASE || 'https://infostorktechnolabs.onrender.com'

export async function postChat(prompt) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })
  if (!res.ok) {
    throw new Error('Server error')
  }
  return await res.json()
}
