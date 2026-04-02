import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EduInstitute - Top Education Programs 2025',
  description: 'Apply for MBA, Engineering, and Online degree programs. AICTE approved, NAAC A+ accredited.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
