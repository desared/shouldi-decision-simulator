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
import { SimulationResults } from "@/components/dashboard/simulation-results"
import { SurveyModal } from "@/components/survey-modal"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function ShouldISimulator() {
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const router = useRouter()
  const params = useParams()

  // Pre-cached realistic results for free scenarios (no API calls)
  const cachedResults: Record<string, {
    title: string
    status: "optimal" | "moderate" | "risk"
    factors: { id: string; label: string; value: number; min: number; max: number; unit?: string; question: string; answer: string }[]
    outcomes: { id: string; label: string; value: number; rangeMin: number; rangeMax: number; trend: "up" | "down" | "stable"; description: string; confidence: "high" | "medium" | "low"; confidenceInterval: string }[]
  }> = {
    "job-change": {
      title: "Analysis: Should I change jobs?",
      status: "optimal",
      factors: [
        { id: "f1", label: "Salary expectations", value: 70, min: 0, max: 100, question: "How significant is a salary increase in your decision to change jobs?", answer: "It is a major factor — I expect at least a 20% raise" },
        { id: "f2", label: "Work-life balance", value: 60, min: 0, max: 100, question: "How satisfied are you with your current work-life balance?", answer: "Somewhat dissatisfied — I often work late and feel drained" },
        { id: "f3", label: "Career growth", value: 80, min: 0, max: 100, question: "How important is long-term career growth in your decision?", answer: "Very important — I want a clear path to leadership" },
        { id: "f4", label: "Job security", value: 50, min: 0, max: 100, question: "How comfortable are you with the risk of starting at a new company?", answer: "Moderately comfortable — I have savings to cover a few months" },
      ],
      outcomes: [
        { id: "o1", label: "Best Case: Career Advancement and Higher Earnings", value: 78, rangeMin: 65, rangeMax: 90, trend: "up", description: "You land a role with a 25-30% salary increase and a clear promotion track. The new environment reignites your motivation, and within 2 years you reach a senior position. Your professional network expands significantly.", confidence: "high", confidenceInterval: "65-90%" },
        { id: "o2", label: "Likely Case: Moderate Improvement with Adjustment Period", value: 62, rangeMin: 50, rangeMax: 75, trend: "up", description: "You secure a 15-20% raise and enjoy better work-life balance. The first 6 months involve a learning curve and proving yourself in a new culture. Career growth is steady but not immediately dramatic.", confidence: "medium", confidenceInterval: "50-75%" },
        { id: "o3", label: "Worst Case: Challenging Transition with Setbacks", value: 35, rangeMin: 20, rangeMax: 50, trend: "down", description: "The new role doesn't match expectations — culture fit issues or misaligned responsibilities. You may need to job search again within a year. Financially you break even due to the raise offsetting transition costs.", confidence: "low", confidenceInterval: "20-50%" },
      ],
    },
    "buy-rent": {
      title: "Analysis: Buy or rent?",
      status: "moderate",
      factors: [
        { id: "f1", label: "Financial commitment", value: 50, min: 0, max: 100, question: "How comfortable are you with the long-term financial commitment associated with owning a property, including potential property taxes, insurance, and maintenance costs?", answer: "I am generally comfortable with these costs and have a financial plan." },
        { id: "f2", label: "Flexibility needs", value: 50, min: 0, max: 100, question: "Considering your current lifestyle and potential for job changes or relocation, how flexible do you need your living situation to be in the next 5-10 years?", answer: "I prefer flexibility and anticipate the possibility of moving." },
        { id: "f3", label: "Maintenance readiness", value: 70, min: 0, max: 100, question: "How confident are you in your ability to handle unexpected housing-related issues, such as appliance failures, plumbing problems, or other necessary repairs?", answer: "I am generally comfortable handling these issues or hiring someone to do so." },
        { id: "f4", label: "Equity building", value: 50, min: 0, max: 100, question: "How much does the potential for building equity and seeing your housing investment appreciate influence your overall decision-making process?", answer: "This factor is a major driving force in my decision." },
      ],
      outcomes: [
        { id: "o1", label: "Best Case: Property Ownership Leads to Significant Financial Gains", value: 60, rangeMin: 45, rangeMax: 75, trend: "stable", description: "You purchase a property and experience substantial appreciation in its value over the next 5-10 years. Your financial planning proves effective, allowing you to comfortably manage the ongoing costs of ownership. Despite a preference for flexibility, the potential financial gains outweigh the inconvenience of staying in one place.", confidence: "medium", confidenceInterval: "45-75%" },
        { id: "o2", label: "Likely Case: Moderate Appreciation, Manageable but Some Inconvenience", value: 60, rangeMin: 45, rangeMax: 75, trend: "stable", description: "The property appreciates at a modest rate. You are able to manage maintenance and costs, though unexpected repairs eat into savings occasionally. The lack of flexibility becomes noticeable if career opportunities arise in other locations.", confidence: "medium", confidenceInterval: "45-75%" },
        { id: "o3", label: "Worst Case: Market Downturn and Financial Strain", value: 30, rangeMin: 15, rangeMax: 45, trend: "down", description: "The housing market stagnates or declines. Maintenance costs exceed expectations, and the financial commitment feels burdensome. If you need to relocate for work, selling at a loss becomes a real possibility.", confidence: "low", confidenceInterval: "15-45%" },
      ],
    },
    "relocate": {
      title: "Analysis: Should I move to a new city?",
      status: "moderate",
      factors: [
        { id: "f1", label: "Career opportunities", value: 75, min: 0, max: 100, question: "How significant are career opportunities in the new city compared to your current location?", answer: "The new city has significantly better opportunities in my field" },
        { id: "f2", label: "Cost of living", value: 55, min: 0, max: 100, question: "How does the cost of living in the new city compare to where you live now?", answer: "It is somewhat higher, but my expected income would offset the difference" },
        { id: "f3", label: "Social network", value: 40, min: 0, max: 100, question: "How strong is your existing social network (friends, family, community) in your current city?", answer: "I have a moderate social circle — some close friends and family nearby" },
        { id: "f4", label: "Quality of life", value: 65, min: 0, max: 100, question: "How important are lifestyle factors (climate, culture, outdoor activities) in your decision to relocate?", answer: "Very important — the new city offers a lifestyle I have always wanted" },
      ],
      outcomes: [
        { id: "o1", label: "Best Case: Thriving in a New Environment", value: 72, rangeMin: 60, rangeMax: 85, trend: "up", description: "You settle into the new city quickly, land a great role with a 20% salary boost, and build a fulfilling social circle within the first year. The lifestyle upgrade — better weather, culture, and activities — significantly improves your overall happiness and motivation.", confidence: "high", confidenceInterval: "60-85%" },
        { id: "o2", label: "Likely Case: Gradual Adjustment with Trade-offs", value: 58, rangeMin: 45, rangeMax: 70, trend: "stable", description: "The move goes smoothly logistically, but building new friendships takes 6-12 months. Career-wise you see moderate improvement. The higher cost of living eats into savings initially, though you adapt your budget over time.", confidence: "medium", confidenceInterval: "45-70%" },
        { id: "o3", label: "Worst Case: Isolation and Financial Pressure", value: 30, rangeMin: 15, rangeMax: 45, trend: "down", description: "The new city feels isolating without your support network. The cost of living is higher than expected, and the job market doesn't deliver the opportunities you anticipated. You may consider moving back within 1-2 years.", confidence: "low", confidenceInterval: "15-45%" },
      ],
    },
  }

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
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

  const handlePremiumClick = () => {
    setAuthMode('signup')
    setIsAuthOpen(true)
  }

  const handleCustomQuestionSubmit = (question: string) => {
    setSurveyQuestion(question)
    setIsSurveyOpen(true)
  }

  const handleSelectScenario = (scenarioId: string) => {
    // For free scenarios, show static cached results (no API call)
    setSelectedScenario(scenarioId)
  }

  const goToHome = () => {
    setSelectedScenario(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToSection = (id: string) => {
    if (selectedScenario) {
      setSelectedScenario(null)
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
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
        {!selectedScenario ? (
          <>
            <HeroSection
              customQuestion={customQuestion}
              setCustomQuestion={setCustomQuestion}
              onCustomQuestionSubmit={handleCustomQuestionSubmit}
            />
            <ScenariosSection
              onSelectScenario={handleSelectScenario}
              onPremiumClick={handlePremiumClick}
            />
            <HowItWorksSection />
            <FeaturesSection />
            <PricingSection onGetStarted={handleSignUp} />
            <FAQSection />
            <CTASection onGetStarted={handleSignUp} />
          </>
        ) : (
          selectedScenario && cachedResults[selectedScenario] && (
            <div className="mx-auto max-w-6xl px-4 py-8">
              <SimulationResults
                title={cachedResults[selectedScenario].title}
                factors={cachedResults[selectedScenario].factors}
                outcomes={cachedResults[selectedScenario].outcomes}
                status={cachedResults[selectedScenario].status}
                onBack={() => setSelectedScenario(null)}
                showDownload={false}
              />
            </div>
          )
        )}
      </main>

      {!selectedScenario && <FooterSection />}

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
