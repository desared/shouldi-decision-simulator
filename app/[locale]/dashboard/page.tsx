"use client"

import { useState, useEffect } from "react"
import { Search, ArrowRight, Sparkles, Eye, Trash2, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    const [searchQuery, setSearchQuery] = useState("")
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
    const [surveyModalOpen, setSurveyModalOpen] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null)
    const [viewingScenarioId, setViewingScenarioId] = useState<string | null>(null)

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


    const handleSearchSubmit = () => {
        const trimmed = searchQuery.trim()
        if (!trimmed) return

        let question = trimmed
        if (!trimmed.toLowerCase().startsWith('should i')) {
            question = `Should I ${trimmed}?`
        }
        setCurrentQuestion(question)
        setSurveyModalOpen(true)
        setSearchQuery("")
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

                    {/* Search Bar */}
                    <div className="mx-auto max-w-xl">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t('hero.placeholder')}
                                    className="h-14 pl-12 bg-card text-foreground placeholder:text-muted-foreground text-lg shadow-lg border-2 border-border focus:border-primary"
                                />
                            </div>
                            <Button
                                onClick={handleSearchSubmit}
                                disabled={!searchQuery.trim() || !canCreate}
                                className="h-14 px-6 md:px-8 gradient-primary text-white font-semibold shadow-lg hover:opacity-90 transition-opacity shrink-0"
                            >
                                <span className="hidden sm:inline">{t('hero.simulate')}</span>
                                <ArrowRight className="h-5 w-5 sm:ml-2" />
                            </Button>
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
        </div>
    )
}
