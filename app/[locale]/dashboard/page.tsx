"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, Sparkles, Eye, Trash2, Plus, Lock, Wand2, ChevronDown, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkillIcon } from "@/lib/skills/skill-icon"
import { getAllSkills, getSkill } from "@/lib/skills/registry"
import { detectSkill } from "@/lib/skills/detector"
import { moderateContent } from "@/lib/moderation"
import type { SkillId, SupportedLocale } from "@/lib/skills/types"
import { useLocale } from "next-intl"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFirestore } from "@/contexts/firestore-context"
import { useTranslations } from "next-intl"
import { Timestamp } from "firebase/firestore"
import { DashboardSurveyModal } from "@/components/dashboard/dashboard-survey-modal"
import { SimulationResults } from "@/components/dashboard/simulation-results"
import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"


export default function DashboardPage() {
    const t = useTranslations('dashboard')
    const tHero = useTranslations('hero')
    const tAdvisors = useTranslations('advisors')
    const locale = useLocale() as SupportedLocale
    const [searchQuery, setSearchQuery] = useState("")
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
    const [surveyModalOpen, setSurveyModalOpen] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null)
    const [viewingScenarioId, setViewingScenarioId] = useState<string | null>(null)
    const [selectedSkill, setSelectedSkill] = useState<SkillId | "auto">("auto")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [mismatchOpen, setMismatchOpen] = useState(false)
    const [mismatchData, setMismatchData] = useState<{ question: string; detectedSkillId: SkillId } | null>(null)
    const [moderationOpen, setModerationOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const skills = getAllSkills()

    const {
        scenarios,
        simulations,
        selectedScenario,
        selectScenario,
        deleteScenario,
        loading,
        simulationsLoading,
        freeTierLimits,
        canCreateScenario,
    } = useFirestore()

    const canCreate = canCreateScenario()

    // When viewingScenarioId changes, select that scenario to load its simulations
    useEffect(() => {
        if (viewingScenarioId) {
            selectScenario(viewingScenarioId)
        }
    }, [viewingScenarioId, selectScenario])


    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getSelectedLabel = () => {
        if (selectedSkill === "auto") return tHero('autoAssigned')
        const skill = skills.find(s => s.id === selectedSkill)
        return skill?.displayName[locale] ?? tHero('autoAssigned')
    }

    const getSelectedIcon = () => {
        if (selectedSkill === "auto") return null
        const skill = skills.find(s => s.id === selectedSkill)
        return skill?.icon ?? null
    }

    const buildQuestion = (input: string): string => {
        if (input.toLowerCase().startsWith('should i') || input.toLowerCase().startsWith('should')) {
            return input
        }
        return `Should I ${input}?`
    }

    const openSurvey = (question: string, skillId?: SkillId) => {
        setCurrentQuestion(question)
        setSurveyModalOpen(true)
        setSearchQuery("")
    }

    const tModeration = useTranslations('moderation')

    const handleSearchSubmit = () => {
        const trimmed = searchQuery.trim()
        if (!trimmed) return
        const question = buildQuestion(trimmed)

        // Content moderation check
        const modResult = moderateContent(question)
        if (modResult.blocked) {
            setModerationOpen(true)
            return
        }

        if (selectedSkill === "auto") {
            openSurvey(question)
            return
        }

        const detected = detectSkill(question, locale)
        if (detected.skillId !== "generic" && detected.skillId !== selectedSkill) {
            setMismatchData({ question, detectedSkillId: detected.skillId })
            setMismatchOpen(true)
            return
        }

        openSurvey(question, selectedSkill)
    }

    const handleMismatchSwitch = () => {
        if (!mismatchData) return
        setSelectedSkill(mismatchData.detectedSkillId)
        openSurvey(mismatchData.question, mismatchData.detectedSkillId)
        setMismatchOpen(false)
        setMismatchData(null)
    }

    const handleMismatchAutoDetect = () => {
        if (!mismatchData) return
        setSelectedSkill("auto")
        openSurvey(mismatchData.question)
        setMismatchOpen(false)
        setMismatchData(null)
    }

    const handleMismatchContinue = () => {
        if (!mismatchData) return
        openSurvey(mismatchData.question, selectedSkill === "auto" ? undefined : selectedSkill)
        setMismatchOpen(false)
        setMismatchData(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearchSubmit()
        }
    }

    const handleDeleteScenario = async () => {
        if (!scenarioToDelete) return
        try {
            await deleteScenario(scenarioToDelete)
        } catch (error) {
            console.error("Error deleting scenario:", error)
        } finally {
            setScenarioToDelete(null)
            setDeleteDialogOpen(false)
        }
    }

    const handleViewScenario = (scenarioId: string) => {
        setViewingScenarioId(scenarioId)
    }

    const handleBackFromResults = () => {
        setViewingScenarioId(null)
        selectScenario('')
    }

    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return "Just now"
        try {
            const date = timestamp.toDate()
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        } catch {
            return "Just now"
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    // Viewing a specific scenario's simulations
    if (viewingScenarioId && selectedScenario) {
        // Show loading while simulations are being fetched
        if (simulationsLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            )
        }

        // Show results if we have simulations
        if (simulations.length > 0) {
            return (
                <div className="space-y-10">
                    {simulations.map((simulation, index) => (
                        <div key={simulation.id} className="relative">
                            {/* Visual separator for multiple simulations */}
                            {index > 0 && (
                                <div className="absolute -top-5 left-0 right-0 flex items-center justify-center">
                                    <div className="h-px bg-border w-full max-w-xs"></div>
                                </div>
                            )}

                            <SimulationResults
                                title={simulation.title}
                                factors={simulation.factors}
                                outcomes={simulation.outcomes}
                                status={simulation.status}
                                recommendation={simulation.recommendation}
                                onBack={handleBackFromResults}
                            />

                            <div className="flex justify-end mt-2">
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(simulation.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Add simulation button removed as per requirements - 1 simulation per scenario */}
                </div>
            )
        }

        // No simulations found - should not normally happen
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">{t('emptyState.description')}</p>
                <Button onClick={handleBackFromResults} variant="outline" className="mt-4">
                    {t('results.back')}
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {/* Hero Section with Search */}
            <section className="relative py-8 md:py-12">
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob" />
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000" />
                </div>

                <div className="text-center max-w-3xl mx-auto">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            {t('hero.badge')}
                        </span>
                    </div>

                    {/* Main headline */}
                    <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                        {t('hero.title')}
                    </h1>

                    {/* Subheadline */}
                    <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                        {t('hero.subtitle')}
                    </p>

                    {/* Chatbot-style Search Bar */}
                    <div className="mx-auto max-w-xl">
                        <div className="rounded-2xl border-2 border-border bg-card shadow-xl transition-colors focus-within:border-primary">
                            {/* Input area */}
                            <div className="flex items-center gap-2 px-4 py-3">
                                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t('hero.placeholder')}
                                    className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none"
                                />
                            </div>

                            {/* Bottom toolbar */}
                            <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-3 py-2 rounded-b-2xl">
                                {/* Skill selector */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                    >
                                        {getSelectedIcon() ? (
                                            <SkillIcon name={getSelectedIcon()!} className="h-4 w-4 text-primary" />
                                        ) : (
                                            <Wand2 className="h-4 w-4 text-primary" />
                                        )}
                                        <span>{getSelectedLabel()}</span>
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Dropdown */}
                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
                                            <div className="px-3 py-2 border-b border-border">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    {tHero('advisorLabel')}
                                                </p>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto py-1">
                                                {/* Auto-detect option */}
                                                <button
                                                    onClick={() => { setSelectedSkill("auto"); setIsDropdownOpen(false) }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors"
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                                        <Wand2 className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground">{tHero('autoAssigned')}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{tHero('autoDescription')}</p>
                                                    </div>
                                                    {selectedSkill === "auto" && (
                                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                                    )}
                                                </button>

                                                <div className="h-px bg-border mx-3 my-1" />

                                                {/* Skill options */}
                                                {skills.map((skill) => {
                                                    const advisorKey = skill.id === "real-estate" ? "realEstate" : skill.id
                                                    return (
                                                        <button
                                                            key={skill.id}
                                                            onClick={() => { setSelectedSkill(skill.id); setIsDropdownOpen(false) }}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors"
                                                        >
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                                                <SkillIcon name={skill.icon} className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground">{skill.displayName[locale]}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{tAdvisors(`${advisorKey}.description`)}</p>
                                                            </div>
                                                            {selectedSkill === skill.id && (
                                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Submit button */}
                                <Button
                                    onClick={handleSearchSubmit}
                                    disabled={!searchQuery.trim() || !canCreate}
                                    size="sm"
                                    className="gradient-primary text-white font-semibold hover:opacity-90 transition-opacity gap-1.5"
                                >
                                    {t('hero.simulate')}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Usage indicator */}
                        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                            <span>{scenarios.length}/{freeTierLimits.maxScenarios} {t('hero.scenariosUsed')}</span>
                            {!canCreate && (
                                <button onClick={() => setUpgradeDialogOpen(true)} className="text-yellow-600 dark:text-yellow-400 underline hover:opacity-80 transition-opacity">
                                    {t('hero.upgradeForMore')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Decisions */}
            {scenarios.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-6">
                        {t('recentDecisions')}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {scenarios.map((scenario) => (
                            <div
                                key={scenario.id}
                                className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground truncate pr-8">
                                            {scenario.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                            {scenario.description}
                                        </p>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{formatDate(scenario.createdAt)}</span>
                                            <span>{scenario.simulationCount} {scenario.simulationCount === 1 ? 'simulation' : 'simulations'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewScenario(scenario.id)}
                                        className="gap-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        {t('viewResults')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setScenarioToDelete(scenario.id)
                                            setDeleteDialogOpen(true)
                                        }}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty state */}
            {scenarios.length === 0 && (
                <section className="text-center py-12">
                    <div className="mx-auto max-w-md">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            {t('emptyState.title')}
                        </h3>
                        <p className="mt-2 text-muted-foreground">
                            {t('emptyState.description')}
                        </p>
                    </div>
                </section>
            )}

            {/* Survey Modal */}
            <DashboardSurveyModal
                isOpen={surveyModalOpen}
                onClose={() => setSurveyModalOpen(false)}
                userQuestion={currentQuestion}
                forcedSkillId={selectedSkill === "auto" ? undefined : selectedSkill}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteScenario')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteScenarioDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteScenario}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />

            {/* Mismatch Warning Dialog */}
            <AlertDialog open={mismatchOpen} onOpenChange={setMismatchOpen}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            {tHero('mismatchTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {mismatchData && tHero('mismatchDescription', {
                                detected: getSkill(mismatchData.detectedSkillId).displayName[locale],
                                selected: selectedSkill !== "auto" ? getSkill(selectedSkill).displayName[locale] : tHero('autoAssigned')
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                        {mismatchData && (
                            <Button onClick={handleMismatchSwitch} className="w-full gradient-primary text-white gap-2">
                                <SkillIcon name={getSkill(mismatchData.detectedSkillId).icon} className="h-4 w-4" />
                                {tHero('switchTo', { advisor: getSkill(mismatchData.detectedSkillId).displayName[locale] })}
                            </Button>
                        )}
                        <Button onClick={handleMismatchAutoDetect} variant="outline" className="w-full gap-2">
                            <Wand2 className="h-4 w-4" />
                            {tHero('useAutoDetect')}
                        </Button>
                        <Button onClick={handleMismatchContinue} variant="ghost" className="w-full text-muted-foreground">
                            {tHero('continueAnyway')}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Content Moderation Warning */}
            <AlertDialog open={moderationOpen} onOpenChange={setModerationOpen}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            {tModeration('title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {tModeration('description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button onClick={() => setModerationOpen(false)} variant="outline">
                            {tModeration('close')}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
