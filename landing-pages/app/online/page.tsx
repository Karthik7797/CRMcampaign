import LeadForm from '../../components/LeadForm'

export const metadata = { title: 'Online Degree Programs 2025 | Learn from Anywhere — EduInstitute' }

export default function OnlinePage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #001a0d 0%, #002a1a 50%, #001020 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-20 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <span className="text-white font-bold">EduInstitute</span>
        <a href="/" className="text-sm text-green-400 hover:text-white transition-colors">← All Programs</a>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-300 text-xs px-3 py-1.5 rounded-full mb-6">
            🌐 UGC-DEB Approved Online Programs
          </div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Study Online,<br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Earn Real Degree
            </span>
          </h1>
          <p className="text-white/55 text-lg mb-8 max-w-lg">
            UGC approved online degrees. EMI options available. Industry mentors included.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            {['Live Classes', 'Recorded Lectures', 'Industry Projects', 'Career Support', 'EMI Available', 'Certifications'].map(f => (
              <span key={f} className="text-xs bg-white/5 border border-green-500/20 text-green-300/70 px-3 py-1.5 rounded-full">{f}</span>
            ))}
          </div>
        </div>
        <div>
          <LeadForm
            landingPage="online"
            campaignName="Online 2025"
            courses={['Online MBA', 'Online BBA', 'Online MCA', 'Online BCA', 'Online M.Com', 'Online B.Com']}
            buttonText="Enroll Online Today →"
            formTitle="Start Your Online Journey"
          />
        </div>
      </section>

      <footer className="relative z-10 py-6 px-6 text-center">
        <p className="text-white/20 text-xs">© 2025 EduInstitute · Online Campaign</p>
      </footer>
    </main>
  )
}
