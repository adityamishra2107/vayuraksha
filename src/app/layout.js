import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'VayuRaksha | Convective Scale Nowcasting',
  description: 'High-resolution, short-range forecasting of localized, rapidly developing severe atmospheric storms.',
  icons: {
    icon: '/vayuraksha-logo.png',
    apple: '/vayuraksha-logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased text-slate-100`}>
        {children}
      </body>
    </html>
  )
}
