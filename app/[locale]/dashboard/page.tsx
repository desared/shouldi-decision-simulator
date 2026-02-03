"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimulationCard } from "@/components/dashboard/simulation-card"
import { SimulationPanel, Factor, Outcome } from "@/components/simulation-panel"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import { Timestamp } from "firebase/firestore"

export default function DashboardPage() {
    const [viewMode, setViewMode] = useState<"list" | "detail" | "new">("list")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [simulationToDelete, setSimulationToDelete] = useState<string | null>(null)

    const {
        selectedScenario,
        simulations,
        selectedSimulation,
        selectSimulation,
        createSimulation,
        updateSimulation,
        deleteSimulation,
        simulationsLoading,
        loading,
    } = useFirestore()

    // Context-aware defaults for new simulation
    const { defaultFactors, defaultOutcomes } = useMemo(() => {
        const title = selectedScenario?.title || ""

        if (title === "Buy vs Rent") {
            return {
                defaultFactors: [
                    { id: "property-price", label: "Property Price", value: 500, min: 100, max: 2000, unit: "k" },
                    { id: "monthly-rent", label: "Monthly Rent", value: 2000, min: 500, max: 10000, unit: "$" },
                    { id: "mortgage-rate", label: "Interest Rate", value: 6.5, min: 2, max: 15, unit: "%" },
                    { id: "appreciation", label: "Appreciation", value: 4, min: -5, max: 15, unit: "%" },
                ],
                defaultOutcomes: [
                    { id: "net-worth", label: "Net Worth (10y)", value: 50, rangeMin: 40, rangeMax: 60, trend: "stable" as const },
                    { id: "monthly-cashflow", label: "Monthly Cashflow", value: 40, rangeMin: 30, rangeMax: 50, trend: "stable" as const },
                    { id: "flexibility", label: "Flexibility", value: 30, rangeMin: 20, rangeMax: 40, trend: "down" as const },
                ]
            }
        }

        if (title === "Move to a New City") {
            return {
                defaultFactors: [
                    { id: "col-change", label: "Cost of Living", value: 10, min: -50, max: 100, unit: "%" },
                    { id: "moving-cost", label: "Moving Costs", value: 5000, min: 1000, max: 20000, unit: "$" },
                    { id: "quality-life", label: "Quality of Life", value: 70, min: 0, max: 100, unit: "/100" },
                    { id: "social-network", label: "Social Network", value: 30, min: 0, max: 100, unit: "/100" },
                ],
                defaultOutcomes: [
                    { id: "disposable-income", label: "Disposable Income", value: 60, rangeMin: 50, rangeMax: 70, trend: "up" as const },
                    { id: "happiness", label: "Overall Happiness", value: 65, rangeMin: 55, rangeMax: 75, trend: "up" as const },
                    { id: "career-opps", label: "Job Opportunities", value: 60, rangeMin: 50, rangeMax: 70, trend: "stable" as const },
                ]
            }
        }

        // Default: Change Jobs / Other
        return {
            defaultFactors: [
                { id: "salary-change", label: "Salary Change", value: 20, min: -50, max: 100, unit: "%" },
                { id: "commute-time", label: "Commute Time", value: 30, min: 0, max: 120, unit: " min" },
                { id: "job-satisfaction", label: "Expected Satisfaction", value: 70, min: 0, max: 100, unit: "%" },
                { id: "career-growth", label: "Career Growth", value: 80, min: 0, max: 100, unit: "%" },
            ],
            defaultOutcomes: [
                { id: "financial", label: "Financial Stability", value: 60, rangeMin: 50, rangeMax: 70, trend: "up" as const },
                { id: "work-life", label: "Work-Life Balance", value: 50, rangeMin: 40, rangeMax: 60, trend: "stable" as const },
                { id: "growth", label: "Career Advancement", value: 75, rangeMin: 65, rangeMax: 85, trend: "up" as const },
            ]
        }
    }, [selectedScenario?.title])

    const handleCreateNew = () => {
        selectSimulation(null)
        setViewMode("new")
    }

    const handleViewSimulation = (id: string) => {
        selectSimulation(id)
        setViewMode("detail")
    }

    const handleBack = () => {
        setViewMode("list")
        selectSimulation(null)
    }

    const handleSave = async (factors: Factor[], outcomes: Outcome[]) => {
        if (!selectedScenario) return

        // Calculate status based on outcomes
        const avgValue = outcomes.reduce((acc, o) => acc + o.value, 0) / outcomes.length
        const status: "optimal" | "moderate" | "risk" =
            avgValue >= 70 ? "optimal" : avgValue >= 40 ? "moderate" : "risk"

        // Create input summary
        const inputSummary = factors.slice(0, 2).map((f) => ({
            label: f.label,
            value: `${f.value}${f.unit || ""}`,
        }))

        // Create outcome summary (use first outcome)
        const primaryOutcome = outcomes[0]
        const outcomeSummary = {
            label: primaryOutcome.label,
            value: `${primaryOutcome.value}%`,
            trend:
                primaryOutcome.trend === "up"
                    ? ("positive" as const)
                    : primaryOutcome.trend === "down"
                        ? ("negative" as const)
                        : ("neutral" as const),
        }

        try {
            if (viewMode === "new") {
                // Create new simulation
                const title = `Simulation ${new Date().toLocaleDateString()}`
                await createSimulation({
                    title,
                    status,
                    factors,
                    outcomes,
                    inputSummary,
                    outcomeSummary,
                })
            } else if (selectedSimulation) {
                // Update existing simulation
                await updateSimulation(selectedSimulation.id, {
                    status,
                    factors,
                    outcomes,
                    inputSummary,
                    outcomeSummary,
                })
            }
            handleBack()
        } catch (error) {
            console.error("Error saving simulation:", error)
        }
    }

    const handleDeleteConfirm = async () => {
        if (simulationToDelete) {
            try {
                await deleteSimulation(simulationToDelete)
            } catch (error) {
                console.error("Error deleting simulation:", error)
            } finally {
                setSimulationToDelete(null)
                setDeleteDialogOpen(false)
            }
        }
    }

    const formatDate = (timestamp: Timestamp | undefined) => {
        if (!timestamp) return "Just now"
        try {
            const date = timestamp.toDate()
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
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

    // No scenario selected
    if (!selectedScenario) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-xl font-semibold text-foreground">No Scenario Selected</h2>
                <p className="mt-2 text-muted-foreground">Select a scenario from the sidebar to view simulations.</p>
            </div>
        )
    }

    // Detail/New view
    if (viewMode === "new" || viewMode === "detail") {
        const currentFactors = selectedSimulation?.factors || defaultFactors
        const currentOutcomes = selectedSimulation?.outcomes || defaultOutcomes
        const title = viewMode === "new" ? "New Simulation" : selectedSimulation?.title || "Simulation Details"

        return (
            <div className="space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={handleBack} className="cursor-pointer">
                                Home
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={handleBack} className="cursor-pointer">
                                {selectedScenario.title}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <SimulationPanel
                    title={title}
                    description="Adjust the factors below to see how they impact your life trajectory."
                    factors={currentFactors}
                    outcomes={currentOutcomes}
                    onBack={handleBack}
                    onSave={handleSave}
                />
            </div>
        )
    }

    // List view
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{selectedScenario.title}</h1>
                    <p className="mt-2 text-muted-foreground">{selectedScenario.description}</p>
                </div>
                <Button onClick={handleCreateNew} className="gradient-primary text-white shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" />
                    New Simulation
                </Button>
            </div>

            {simulationsLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {simulations.map((sim) => (
                        <SimulationCard
                            key={sim.id}
                            title={sim.title}
                            date={formatDate(sim.createdAt)}
                            status={sim.status}
                            inputs={sim.inputSummary}
                            outcome={sim.outcomeSummary}
                            onView={() => handleViewSimulation(sim.id)}
                            onEdit={() => handleViewSimulation(sim.id)}
                            onDelete={() => {
                                setSimulationToDelete(sim.id)
                                setDeleteDialogOpen(true)
                            }}
                        />
                    ))}

                    {/* Helper card to encourage more simulations */}
                    <button
                        onClick={handleCreateNew}
                        className="group flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-transparent p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10">
                            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary">Create New Simulation</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Start from scratch with default values</p>
                    </button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Simulation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this simulation. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
