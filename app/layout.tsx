import { JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'  // Import directly from next-themes
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata = {
  title: 'ASCII Art Generator',
  description: 'Convert images to ASCII art',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} text-base`} suppressHydrationWarning>
      <body className="font-mono min-w-[320px]">
        <ThemeProvider attribute="data-theme" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

