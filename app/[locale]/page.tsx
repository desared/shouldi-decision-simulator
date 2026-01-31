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
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { FAQSection } from "@/components/sections/faq-section"
import { CTASection } from "@/components/sections/cta-section"
import { FooterSection } from "@/components/sections/footer-section"
import { SimulationPanelTranslated } from "@/components/simulation-panel-translated"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LifePathSimulator() {
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const tFactors = useTranslations('factors')
  const tOutcomes = useTranslations('outcomes')
  const tScenarios = useTranslations('scenarios')
  const router = useRouter()
  const params = useParams()

  const scenarios = [
    {
      id: "job-change",
      titleKey: "jobChange.title",
      descriptionKey: "jobChange.description",
      factors: [
        { id: "salary-change", labelKey: "salaryChange", value: 20, min: -50, max: 100, unit: "%" },
        { id: "commute-time", labelKey: "commuteTime", value: 30, min: 0, max: 120, unit: " min" },
        { id: "job-satisfaction", labelKey: "jobSatisfaction", value: 70, min: 0, max: 100, unit: "%" },
        { id: "career-growth", labelKey: "careerGrowth", value: 65, min: 0, max: 100, unit: "%" },
      ],
      outcomes: [
        { id: "financial", labelKey: "financialStability", value: 72, rangeMin: 60, rangeMax: 85, trend: "up" as const },
        { id: "happiness", labelKey: "workLifeBalance", value: 65, rangeMin: 50, rangeMax: 78, trend: "up" as const },
        { id: "stress", labelKey: "stressLevel", value: 45, rangeMin: 35, rangeMax: 60, trend: "down" as const },
        { id: "growth", labelKey: "careerAdvancement", value: 78, rangeMin: 65, rangeMax: 90, trend: "up" as const },
        { id: "decision-score", labelKey: "decisionScore", value: 74, rangeMin: 62, rangeMax: 86, trend: "up" as const },
      ],
    },
    {
      id: "relocate",
      titleKey: "relocate.title",
      descriptionKey: "relocate.description",
      factors: [
        { id: "cost-living", labelKey: "costOfLiving", value: -15, min: -50, max: 50, unit: "%" },
        { id: "income-change", labelKey: "incomeChange", value: 10, min: -30, max: 50, unit: "%" },
        { id: "social-network", labelKey: "socialNetwork", value: 40, min: 0, max: 100, unit: "%" },
        { id: "quality-life", labelKey: "qualityOfLife", value: 75, min: 0, max: 100, unit: "%" },
      ],
      outcomes: [
        { id: "savings", labelKey: "savingsRate", value: 58, rangeMin: 45, rangeMax: 72, trend: "up" as const },
        { id: "social", labelKey: "socialWellbeing", value: 42, rangeMin: 28, rangeMax: 55, trend: "down" as const },
        { id: "career", labelKey: "careerOpportunities", value: 70, rangeMin: 58, rangeMax: 85, trend: "up" as const },
        { id: "happiness", labelKey: "overallHappiness", value: 65, rangeMin: 50, rangeMax: 78, trend: "stable" as const },
        { id: "decision-score", labelKey: "decisionScore", value: 68, rangeMin: 55, rangeMax: 80, trend: "up" as const },
      ],
    },
    {
      id: "buy-rent",
      titleKey: "buyRent.title",
      descriptionKey: "buyRent.description",
      factors: [
        { id: "property-price", labelKey: "propertyPrice", value: 50, min: 0, max: 1000, unit: "k" },
        { id: "interest-rate", labelKey: "interestRate", value: 5, min: 1, max: 10, unit: "%" },
        { id: "rent-cost", labelKey: "monthlyRent", value: 20, min: 5, max: 50, unit: "00" },
        { id: "market-growth", labelKey: "marketGrowth", value: 3, min: -2, max: 10, unit: "%" },
      ],
      outcomes: [
        { id: "net-worth", labelKey: "netWorth10y", value: 60, rangeMin: 40, rangeMax: 80, trend: "up" as const },
        { id: "monthly-cashflow", labelKey: "monthlyCashflow", value: 45, rangeMin: 30, rangeMax: 60, trend: "down" as const },
        { id: "flexibility", labelKey: "flexibilityScore", value: 30, rangeMin: 10, rangeMax: 50, trend: "down" as const },
        { id: "decision-score", labelKey: "decisionScore", value: 55, rangeMin: 40, rangeMax: 70, trend: "stable" as const },
      ],
    },
  ]

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [customQuestion, setCustomQuestion] = useState("")
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
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

  const activeScenario = scenarios.find((s) => s.id === selectedScenario)

  // Transform scenario data with translations
  const getTranslatedScenario = () => {
    if (!activeScenario) return null
    return {
      ...activeScenario,
      title: tScenarios(activeScenario.titleKey),
      description: tScenarios(activeScenario.descriptionKey),
      factors: activeScenario.factors.map(f => ({
        ...f,
        label: tFactors(f.labelKey)
      })),
      outcomes: activeScenario.outcomes.map(o => ({
        ...o,
        label: tOutcomes(o.labelKey)
      }))
    }
  }

  const handleGetStarted = () => {
    setIsAuthOpen(true)
  }

  const handlePremiumClick = () => {
    setIsAuthOpen(true)
  }

  const goToHome = () => {
    setSelectedScenario(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToSection = (id: string) => {
    if (selectedScenario) {
      setSelectedScenario(null)
      // Wait for re-render to ensure section exists
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const translatedScenario = getTranslatedScenario()

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
            <span className="text-xl font-bold text-foreground">LifePath</span>
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
              <Button onClick={handleGetStarted} className="hidden sm:flex gradient-primary text-white">
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
                <Button onClick={handleGetStarted} className="w-full gradient-primary text-white">
                  {tCommon('logIn')}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {!selectedScenario ? (
          <>
            <HeroSection
              customQuestion={customQuestion}
              setCustomQuestion={setCustomQuestion}
              onSelectScenario={setSelectedScenario}
              onPremiumClick={handlePremiumClick}
            />
            <ScenariosSection
              onSelectScenario={setSelectedScenario}
              onPremiumClick={handlePremiumClick}
            />
            <HowItWorksSection />
            <FeaturesSection />
            <TestimonialsSection />
            <PricingSection onGetStarted={handleGetStarted} />
            <FAQSection />
            <CTASection onGetStarted={handleGetStarted} />
          </>
        ) : (
          translatedScenario && (
            <SimulationPanelTranslated
              title={translatedScenario.title}
              description={translatedScenario.description}
              factors={translatedScenario.factors}
              outcomes={translatedScenario.outcomes}
              onBack={() => setSelectedScenario(null)}
              onSignUp={handleGetStarted}
              user={user}
            />
          )
        )}
      </main>

      {!selectedScenario && <FooterSection />}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="signup"
      />
    </div>
  )
}
