'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Github, Twitter, Rss, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Layout({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useTheme()

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-mono">
            <div className="max-w-3xl mx-auto px-2 xs:px-4">
                <header className="py-2 xs:py-6 border-b border-[var(--border)]">
                    <nav className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2 xs:gap-4 md:gap-8">
                            <Link href="/" className="text-[var(--link)] hover:underline text-[clamp(0.8rem,2.5vw,1.25rem)]">
                                [ Home ]
                            </Link>
                            <Link href="/about" className="text-[var(--link)] hover:underline text-[clamp(0.8rem,2.5vw,1.25rem)]">
                                [ About ]
                            </Link>
                            <Link href="/gallery" className="text-[var(--link)] hover:underline text-[clamp(0.8rem,2.5vw,1.25rem)]">
                                [ Gallery ]
                            </Link>
                        </div>
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="text-[var(--link)] ml-2 xs:ml-3 md:ml-4"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 xs:h-5 xs:w-5 md:h-5 md:w-5 sm:h-6 sm:w-6" />
                            ) : (
                                <Moon className="h-5 w-5 xs:h-5 xs:w-5 md:h-5 md:w-5 sm:h-6 sm:w-6" />
                            )}
                        </button>
                    </nav>
                </header>
                <main className="py-8 xs:py-12">{children}</main>
                <footer className="py-6 xs:py-8 border-t border-[var(--border)]">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="text-[var(--muted)] hover:text-[var(--link)] text-[clamp(1rem,2.5vw,1.2rem)]">
                            Home
                        </Link>
                        <a href="https://github.com/hoenogatari" className="text-[var(--muted)] hover:text-[var(--link)]">
                            <Github className="h-5 w-5" />
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    )
}

