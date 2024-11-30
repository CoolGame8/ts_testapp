import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Weather & NBA Dashboard',
  description: 'A modern dashboard showing Tokyo weather and NBA scores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-200 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 bg-gradient-to-br from-blue-50 to-gray-100`}>
        <ThemeProvider>
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
