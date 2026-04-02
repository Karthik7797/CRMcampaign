import LeadForm from '../../components/LeadForm'

export const metadata = {
  title: 'Education Programs 2025 | B.Ed, M.Ed, D.El.Ed — EduInstitute',
  description: 'Apply for B.Ed, M.Ed, D.El.Ed, ECCE. NCTE approved. 100% job-ready teacher training programs.',
}

export default function EducationPage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #1a0f00 0%, #2a1800 40%, #1a1005 100%)' }}>
      {/* Decorative */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-20 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">E</span>
          </div>
          <span className="text-white font-bold">EduInstitute</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <a href="/mba" className="hover:text-white transition-colors">MBA →</a>
          <a href="/engineering" className="hover:text-white transition-colors">Engineering →</a>
          <a href="/" className="hover:text-white transition-colors">All Programs</a>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-3 py-1.5 rounded-full mb-6">
            🎓 NCTE Approved · Education Programs 2025
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Shape the Next<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Generation of<br />Learners
            </span>
          </h1>

          <p className="text-white/55 text-lg mb-8 max-w-lg">
            Become a certified educator. NCTE approved programs with mandatory teaching practicum, school internships, and 100% placement assistance.
          </p>

          {/* Program Highlights */}
          <div className="space-y-3 mb-8">
            {[
              ['B.Ed (Bachelor of Education)', '2-year program for graduate teachers', 'bg-amber-500'],
              ['M.Ed (Master of Education)', '2-year advanced specialization', 'bg-orange-500'],
              ['D.El.Ed (Diploma in Elementary Education)', '2-year program for primary teachers', 'bg-yellow-500'],
              ['ECCE (Early Childhood Care & Education)', '1-year certificate program', 'bg-red-500'],
            ].map(([name, desc, color]) => (
              <div key={name} className="flex items-start gap-3 bg-white/5 border border-amber-500/10 rounded-xl p-4 hover:border-amber-500/25 transition-colors">
                <div className={`w-2 h-2 rounded-full ${color} mt-2 shrink-0`} />
                <div>
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="text-xs text-white/45 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-5">
            {[['100%', 'Job Ready'], ['50+', 'Partner Schools'], ['NCTE', 'Approved'], ['4.8★', 'Rating']].map(([val, label]) => (
              <div key={label}>
                <div className="text-xl font-black text-amber-400">{val}</div>
                <div className="text-xs text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <LeadForm
            landingPage="education"
            campaignName="Education 2025"
            courses={['B.Ed (Bachelor of Education)', 'M.Ed (Master of Education)', 'D.El.Ed (Diploma Elementary)', 'ECCE (Early Childhood)', 'B.Ed Special Education', 'B.Ed Physical Education']}
            buttonText="Apply for Education 2025 →"
            formTitle="Start Your Teaching Career"
            qualifications={['12th', 'Graduate (Any Stream)', 'Post Graduate', 'Working Teacher']}
            extraFields={[
              { name: 'teachingExp', placeholder: 'Teaching Experience (in years)', type: 'text' },
            ]}
          />
        </div>
      </section>

      {/* Accreditation */}
      <div className="relative z-10 border-y border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/30 text-xs mb-4 uppercase tracking-widest">Recognized By</p>
          <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm font-medium">
            {['NCTE', 'UGC', 'NAAC A+', 'AICTE', 'State Education Board', 'CBSE Affiliation'].map(u => (
              <span key={u}>{u}</span>
            ))}
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-6 px-6 text-center">
        <p className="text-white/20 text-xs">© 2025 EduInstitute · Education Campaign</p>
      </footer>
    </main>
  )
}
