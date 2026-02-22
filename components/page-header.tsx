"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { LogoIcon } from "@/components/logo-icon"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { AuthModal } from "@/components/auth-modal"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function PageHeader() {
  const tNav = useTranslations("nav")
  const tCommon = useTranslations("common")
  const params = useParams()
  const locale = params.locale || "en"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const navItems = [
    { label: tNav("howItWorks"), href: `/${locale}/#how-it-works` },
    { label: tNav("features"), href: `/${locale}/#features` },
    { label: tNav("advisors"), href: `/${locale}/#advisors` },
    { label: tNav("pricing"), href: `/${locale}/#pricing` },
    { label: tNav("faq"), href: `/${locale}/#faq` },
  ]

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <LogoIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">
            should<span className="text-primary">i</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {user ? (
            <Link href={`/${locale}/dashboard`}>
              <Button variant="outline" className="hidden sm:flex gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <Button onClick={() => setIsAuthOpen(true)} className="hidden sm:flex gradient-primary text-white">
              {tCommon('logIn')}
            </Button>
          )}

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground text-left py-2"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              {user ? (
                <Link href={`/${locale}/dashboard`}>
                  <Button variant="outline" className="w-full gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Button onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false) }} className="w-full gradient-primary text-white">
                  {tCommon('logIn')}
                </Button>
              )}
            </div>
            <div className="pt-4 border-t border-border flex items-center gap-3">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>

    <AuthModal
      isOpen={isAuthOpen}
      onClose={() => setIsAuthOpen(false)}
      defaultMode="signin"
    />
    </>
  )
}
