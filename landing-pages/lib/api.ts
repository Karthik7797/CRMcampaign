const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export async function submitLead(formData: {
  name: string
  email: string
  phone: string
  course?: string
  city?: string
  qualification?: string
  landingPage: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}) {
  const res = await fetch(`${API_URL}/leads/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  if (!res.ok) throw new Error('Failed to submit')
  return res.json()
}
