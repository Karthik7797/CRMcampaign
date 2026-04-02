import LeadForm from '../../components/LeadForm'

export const metadata = {
  title: 'MBA Programs 2025 | Top Business School — EduInstitute',
  description: 'Apply for MBA Finance, Marketing, HR, Operations, Business Analytics. 98% placement rate, ₹18L average package.',
}

export default function MBAPage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #0a0a2e 0%, #0d1b4a 40%, #1a0a3e 100%)' }}>
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">E</span>
          </div>
          <span className="text-white font-bold">EduInstitute</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <a href="/engineering" className="hover:text-white transition-colors">Engineering →</a>
          <a href="/education" className="hover:text-white transition-colors">Education →</a>
          <a href="/" className="hover:text-white transition-colors">All Programs</a>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            MBA Admissions Open 2025–26
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Transform Your<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Career with MBA
            </span>
          </h1>

          <p className="text-white/55 text-lg mb-8 leading-relaxed max-w-lg">
            Join 5,000+ alumni in top Fortune 500 companies. AICTE approved, NAAC A+ accredited.
          </p>

          <div className="flex flex-wrap gap-6 mb-8">
            {[['98%', 'Placement'], ['₹18L', 'Avg CTC'], ['200+', 'Recruiters'], ['6', 'Specializations']].map(([val, label]) => (
              <div key={label}>
                <div className="text-2xl font-black text-white">{val}</div>
                <div className="text-xs text-white/40">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {['Finance', 'Marketing', 'HR', 'Operations', 'Business Analytics', 'International Business'].map(sp => (
              <span key={sp} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300/70 px-3 py-1.5 rounded-full">{sp}</span>
            ))}
          </div>
        </div>

        <div>
          <LeadForm
            landingPage="mba"
            campaignName="MBA 2025"
            courses={['MBA Finance', 'MBA Marketing', 'MBA Operations', 'MBA HR', 'MBA Business Analytics', 'MBA International Business']}
            buttonText="Apply for MBA 2025 →"
            formTitle="Get Free Career Counselling"
            qualifications={['Graduate', 'Post Graduate', 'Working Professional']}
          />
        </div>
      </section>

      {/* Trust bar */}
      <div className="relative z-10 border-y border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/30 text-xs mb-4 uppercase tracking-widest">Top Recruiters</p>
          <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm font-medium">
            {['Deloitte', 'KPMG', 'Infosys', 'Wipro', 'Accenture', 'Amazon', 'TCS', 'HCL'].map(u => (
              <span key={u}>{u}</span>
            ))}
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-6 px-6 text-center">
        <p className="text-white/20 text-xs">© 2025 EduInstitute · MBA Campaign</p>
      </footer>
    </main>
  )
}
