import LeadForm from '../../components/LeadForm'

export const metadata = { title: 'Scholarship Programs 2025 | Up to 100% Fee Waiver — EduInstitute' }

export default function ScholarshipPage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #0d0b1e 0%, #1a0a2e 50%, #0d1b2a 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <span className="text-white font-bold">EduInstitute</span>
        <a href="/" className="text-sm text-purple-400 hover:text-white transition-colors">← All Programs</a>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs px-3 py-1.5 rounded-full mb-6">
            🏆 Scholarship Applications Open
          </div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Unlock Your<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Full Scholarship
            </span>
          </h1>
          <p className="text-white/55 text-lg mb-8 max-w-lg">
            Merit-based scholarships up to 100% fee waiver. Apply before 31st August 2025.
          </p>
          <div className="space-y-3 mb-8">
            {[
              ['Merit Scholarship', 'Up to 100% waiver for top rankers', 'bg-purple-500'],
              ['Need-based Aid', 'Up to 75% for economically weaker sections', 'bg-pink-500'],
              ['Sports Quota', 'Up to 50% for national/state players', 'bg-blue-500'],
            ].map(([name, desc, color]) => (
              <div key={name} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className={`w-2 h-2 rounded-full ${color} mt-2 shrink-0`} />
                <div>
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="text-xs text-white/45 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <LeadForm
            landingPage="scholarship"
            campaignName="Scholarship 2025"
            courses={['MBA', 'B.Tech', 'BBA', 'BCA', 'MCA', 'M.Tech', 'B.Ed']}
            buttonText="Apply for Scholarship →"
            formTitle="Check Your Eligibility"
          />
        </div>
      </section>

      <footer className="relative z-10 py-6 px-6 text-center">
        <p className="text-white/20 text-xs">© 2025 EduInstitute · Scholarship Campaign</p>
      </footer>
    </main>
  )
}
