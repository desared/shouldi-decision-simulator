"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { Sparkles, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthModal } from "@/components/auth-modal"
import { HeroSection } from "@/components/sections/hero-section"
import { ScenariosSection } from "@/components/sections/scenarios-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { FAQSection } from "@/components/sections/faq-section"
import { CTASection } from "@/components/sections/cta-section"
import { FooterSection } from "@/components/sections/footer-section"
import { SurveyModal } from "@/components/survey-modal"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function ShouldISimulator() {
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const router = useRouter()
  const params = useParams()

  const [customQuestion, setCustomQuestion] = useState("")
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isSurveyOpen, setIsSurveyOpen] = useState(false)
  const [surveyQuestion, setSurveyQuestion] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser && currentUser.emailVerified) {
        setIsAuthOpen(false)
        router.push(`/${params.locale}/dashboard`)
      }
    })
    return () => unsubscribe()
  }, [router, params.locale])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out", error)
    }
  }

  const handleLogIn = () => {
    setAuthMode('signin')
    setIsAuthOpen(true)
  }

  const handleSignUp = () => {
    setAuthMode('signup')
    setIsAuthOpen(true)
  }

  const handleCustomQuestionSubmit = (question: string) => {
    setSurveyQuestion(question)
    setIsSurveyOpen(true)
  }

  // Map scenario IDs to "Should I...?" questions for the survey modal
  const scenarioQuestions: Record<string, string> = {
    "job-change": "Should I change jobs?",
    "buy-rent": "Should I buy or rent a home?",
    "relocate": "Should I move to a new city?",
  }

  const handleSelectScenario = (scenarioId: string) => {
    const question = scenarioQuestions[scenarioId]
    if (question) {
      setSurveyQuestion(question)
      setIsSurveyOpen(true)
    }
  }

  const goToHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <button
            onClick={goToHome}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">should<span className="text-primary">i</span></span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {tNav('howItWorks')}
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {tNav('features')}
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {tNav('pricing')}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {tNav('faq')}
            </button>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <LanguageSwitcher />


            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground hidden sm:inline-block">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <Button onClick={handleLogout} variant="outline" className="hidden sm:flex">
                  Log out
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogIn} className="hidden sm:flex gradient-primary text-white">
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
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground text-left py-2"
              >
                {tNav('howItWorks')}
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground text-left py-2"
              >
                {tNav('features')}
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground text-left py-2"
              >
                {tNav('pricing')}
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground text-left py-2"
              >
                {tNav('faq')}
              </button>
              <div className="pt-4 border-t border-border">
                <Button onClick={handleLogIn} className="w-full gradient-primary text-white">
                  {tCommon('logIn')}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        <HeroSection
          customQuestion={customQuestion}
          setCustomQuestion={setCustomQuestion}
          onCustomQuestionSubmit={handleCustomQuestionSubmit}
        />
        <ScenariosSection
          onSelectScenario={handleSelectScenario}
        />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingSection onGetStarted={handleSignUp} />
        <FAQSection />
        <CTASection onGetStarted={handleSignUp} />
      </main>

      <FooterSection />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />

      {/* Survey Modal — landing page: 2 questions, best case only */}
      <SurveyModal
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        userQuestion={surveyQuestion}
        questionCount={2}
        bestCaseOnly={true}
      />
    </div>
  )
}
