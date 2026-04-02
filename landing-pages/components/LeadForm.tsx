'use client'
import { useState, useEffect } from 'react'
import { submitLead } from '../lib/api'

interface LeadFormProps {
  landingPage: string
  campaignName: string
  courses: string[]
  buttonText?: string
  formTitle?: string
  accentColor?: string
  qualifications?: string[]
  extraFields?: { name: string; placeholder: string; type?: string }[]
}

export default function LeadForm({
  landingPage,
  campaignName,
  courses,
  buttonText = 'Apply Now',
  formTitle = 'Get Free Counselling',
  accentColor = 'white',
  qualifications = ['10th', '12th', 'Graduate', 'Post Graduate'],
  extraFields = [],
}: LeadFormProps) {
  const [form, setForm] = useState<Record<string, string>>({
    name: '', email: '', phone: '', course: '', city: '', qualification: ''
  })
  const [utm, setUtm] = useState({ utmSource: '', utmMedium: '', utmCampaign: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Capture UTM params from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setUtm({
        utmSource: params.get('utm_source') || campaignName,
        utmMedium: params.get('utm_medium') || 'landing_page',
        utmCampaign: params.get('utm_campaign') || `${landingPage}_campaign`,
      })
    }
  }, [campaignName, landingPage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        course: form.course || undefined,
        city: form.city || undefined,
        qualification: form.qualification || undefined,
        landingPage,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
      })
      setStatus('success')
      setForm({ name: '', email: '', phone: '', course: '', city: '', qualification: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-white mb-2">Application Received!</h3>
        <p className="text-white/70 text-sm">Our counsellor will contact you within 24 hours.</p>
        <div className="mt-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 inline-block">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Campaign: </span>
          <span className="text-xs text-white/70 font-medium">{campaignName}</span>
        </div>
        <button onClick={() => setStatus('idle')} className="mt-4 block mx-auto text-sm text-white/60 hover:text-white underline">
          Submit another
        </button>
      </div>
    )
  }

  const inputClass = "w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white">{formTitle}</h3>
        <span className="text-[10px] bg-white/10 text-white/50 px-2 py-1 rounded-full border border-white/10 uppercase tracking-wider">
          {campaignName}
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" type="text" placeholder="Your Full Name *" value={form.name} onChange={handleChange} required className={inputClass} />
        <input name="email" type="email" placeholder="Email Address *" value={form.email} onChange={handleChange} required className={inputClass} />
        <input name="phone" type="tel" placeholder="Phone Number *" value={form.phone} onChange={handleChange} required className={inputClass} />

        <select name="course" value={form.course} onChange={handleChange} className={inputClass}>
          <option value="" className="bg-slate-800">Select Program</option>
          {courses.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
        </select>

        {extraFields.map(field => (
          <input
            key={field.name}
            name={field.name}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            value={form[field.name] || ''}
            onChange={handleChange}
            className={inputClass}
          />
        ))}

        <div className="grid grid-cols-2 gap-3">
          <input name="city" type="text" placeholder="City" value={form.city} onChange={handleChange} className={inputClass} />
          <select name="qualification" value={form.qualification} onChange={handleChange} className={inputClass}>
            <option value="" className="bg-slate-800">Qualification</option>
            {qualifications.map(q => <option key={q} value={q} className="bg-slate-800">{q}</option>)}
          </select>
        </div>

        <button type="submit" disabled={status === 'loading'}
          className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl text-sm
                     hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60
                     shadow-lg shadow-white/20">
          {status === 'loading' ? 'Submitting...' : buttonText}
        </button>

        {status === 'error' && (
          <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>
        )}

        <p className="text-white/40 text-[11px] text-center">
          By submitting, you agree to be contacted by our counsellors.
        </p>
      </form>
    </div>
  )
}
