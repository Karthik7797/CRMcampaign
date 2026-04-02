import Link from 'next/link'

export const metadata = {
  title: 'EduInstitute — Transform Your Future | Top Education Programs 2025',
  description: 'Apply for MBA, B.Tech, Online, and Scholarship programs. AICTE approved, NAAC A+ accredited.',
}

const campaigns = [
  {
    href: '/mba',
    title: 'MBA Programs',
    subtitle: 'Finance · Marketing · HR · Analytics',
    badge: 'Most Popular',
    gradient: 'from-blue-600 to-indigo-700',
    hoverGlow: 'hover:shadow-blue-500/30',
    icon: '📊',
    stats: '98% Placement'
  },
  {
    href: '/engineering',
    title: 'Engineering Programs',
    subtitle: 'CSE · AI/ML · ECE · Mechanical',
    badge: 'NIRF Ranked',
    gradient: 'from-cyan-600 to-teal-700',
    hoverGlow: 'hover:shadow-cyan-500/30',
    icon: '⚡',
    stats: '₹12L+ Avg CTC'
  },
  {
    href: '/education',
    title: 'Education Programs',
    subtitle: 'B.Ed · M.Ed · D.El.Ed · ECCE',
    badge: 'NCTE Approved',
    gradient: 'from-amber-600 to-orange-700',
    hoverGlow: 'hover:shadow-amber-500/30',
    icon: '🎓',
    stats: '100% Job Ready'
  },
  {
    href: '/scholarship',
    title: 'Scholarship Test',
    subtitle: 'Up to 100% Fee Waiver',
    badge: 'Apply by Aug 31',
    gradient: 'from-purple-600 to-pink-700',
    hoverGlow: 'hover:shadow-purple-500/30',
    icon: '🏆',
    stats: 'Merit-based'
  },
  {
    href: '/online',
    title: 'Online Degrees',
    subtitle: 'MBA · BBA · MCA · BCA · B.Com',
    badge: 'UGC-DEB',
    gradient: 'from-emerald-600 to-green-700',
    hoverGlow: 'hover:shadow-emerald-500/30',
    icon: '🌐',
    stats: 'Study from Home'
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <span className="text-slate-900 font-black text-sm">E</span>
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            EduInstitute
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <a href="#programs" className="hover:text-white transition-colors">Programs</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-xs px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Admissions Open for 2025–26 Academic Year
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Choose Your Path to<br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Success
          </span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto mb-4">
          AICTE Approved · NAAC A+ · 5,000+ Successfully Placed Alumni
        </p>
      </section>

      {/* Campaign Cards */}
      <section id="programs" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 
                         hover:border-white/20 hover:bg-white/[0.06] hover:shadow-2xl ${c.hoverGlow}
                         transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{c.icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full 
                                  bg-gradient-to-r ${c.gradient} text-white`}>
                  {c.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white/90"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {c.title}
              </h3>
              <p className="text-sm text-white/50 mb-4">{c.subtitle}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">{c.stats}</span>
                <span className="text-sm text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">
                  Apply Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-white/25 text-xs">© 2025 EduInstitute. All rights reserved. Each landing page tracks campaign source for enrollment analytics.</p>
      </footer>
    </main>
  )
}
