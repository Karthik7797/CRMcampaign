import LeadForm from '../../components/LeadForm'

export const metadata = {
  title: 'B.Tech & M.Tech 2025 | Top Engineering College — EduInstitute',
  description: 'Apply for B.Tech CSE, AI/ML, ECE, Mechanical. NIRF Ranked Top 50. Google, Microsoft, ISRO tie-ups.',
}

export default function EngineeringPage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #001a1a 0%, #002a30 40%, #001520 100%)' }}>
      {/* Decorative */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-20 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">E</span>
          </div>
          <span className="text-white font-bold">EduInstitute</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <a href="/mba" className="hover:text-white transition-colors">MBA →</a>
          <a href="/education" className="hover:text-white transition-colors">Education →</a>
          <a href="/" className="hover:text-white transition-colors">All Programs</a>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Limited Seats · Engineering 2025
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Build the<br />
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Future with<br />Engineering
            </span>
          </h1>

          <p className="text-white/55 text-lg mb-8 max-w-lg">
            NIRF ranked Top 50 engineering institution. State-of-the-art labs, industry tie-ups with Google, Microsoft, and ISRO.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              ['B.Tech', '4-year UG program', '⚙️'],
              ['M.Tech', '2-year PG program', '🔬'],
              ['8 Branches', 'CSE to Mechanical', '🏗️'],
              ['₹12L+', 'Average CTC', '💰'],
            ].map(([title, desc, icon]) => (
              <div key={title} className="bg-white/5 border border-cyan-500/15 rounded-xl p-4 hover:border-cyan-500/30 transition-colors">
                <span className="text-lg">{icon}</span>
                <div className="text-base font-bold text-cyan-400 mt-1">{title}</div>
                <div className="text-xs text-white/45 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <LeadForm
            landingPage="engineering"
            campaignName="Engineering 2025"
            courses={['B.Tech Computer Science', 'B.Tech AI & ML', 'B.Tech ECE', 'B.Tech Mechanical', 'B.Tech Civil', 'B.Tech EEE', 'M.Tech CSE', 'M.Tech VLSI']}
            buttonText="Apply for Engineering 2025 →"
            formTitle="Enquire About Engineering"
            qualifications={['10th', '12th (PCM)', '12th (PCB)', 'Diploma', 'B.Tech (for M.Tech)']}
            extraFields={[
              { name: 'jeeScore', placeholder: 'JEE Score (if applicable)', type: 'text' },
            ]}
          />
        </div>
      </section>

      {/* Lab Partners */}
      <div className="relative z-10 border-y border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/30 text-xs mb-4 uppercase tracking-widest">Industry Partners & Lab Tie-ups</p>
          <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm font-medium">
            {['Google', 'Microsoft', 'ISRO', 'DRDO', 'Intel', 'NVIDIA', 'AWS'].map(u => (
              <span key={u}>{u}</span>
            ))}
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-6 px-6 text-center">
        <p className="text-white/20 text-xs">© 2025 EduInstitute · Engineering Campaign</p>
      </footer>
    </main>
  )
}
