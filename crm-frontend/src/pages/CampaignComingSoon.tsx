import { useParams } from 'react-router-dom'
import { Radio } from 'lucide-react'

export default function CampaignComingSoon() {
  const { n } = useParams<{ n: string }>()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-600/20 flex items-center justify-center">
        <Radio size={32} className="text-brand-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-100 font-display">Campaign {n}</h2>
      <p className="text-slate-400 text-sm max-w-sm">
        This campaign hasn't launched yet. Once the Google Form is ready and the fields are confirmed, this page will be activated.
      </p>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
        Coming Soon
      </span>
    </div>
  )
}
