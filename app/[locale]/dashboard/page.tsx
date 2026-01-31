"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimulationCard } from "@/components/dashboard/simulation-card"
import { SimulationPanel } from "@/components/simulation-panel"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function DashboardPage() {
    const [viewMode, setViewMode] = useState<"list" | "detail" | "new">("list")
    const [selectedSimulationId, setSelectedSimulationId] = useState<string | null>(null)
    const router = useRouter()
    const params = useParams()


    // Mock data - would come from Firebase
    const simulations = [
        {
            id: "sim_001",
            title: "Corporate Pivot 2024",
            date: "Jan 31, 2024",
            status: "optimal" as const,
            inputs: [
                { label: "Salary", value: "+20%" },
                { label: "Commute", value: "30 min" }
            ],
            outcome: {
                label: "Financial Stability",
                value: "72%",
                trend: "positive" as const
            }
        },
        {
            id: "sim_002",
            title: "Startup Offer",
            date: "Jan 15, 2024",
            status: "moderate" as const,
            inputs: [
                { label: "Salary", value: "-10%" },
                { label: "Commute", value: "0 min" }
            ],
            outcome: {
                label: "Stress Level",
                value: "Low (45%)",
                trend: "positive" as const
            }
        }
    ]

    // Default values for new simulation
    const defaultFactors = [
        { id: "salary-change", label: "Salary Change", value: 0, min: -50, max: 100, unit: "%" },
        { id: "commute-time", label: "Commute Time", value: 30, min: 0, max: 120, unit: " min" },
        { id: "job-satisfaction", label: "Expected Satisfaction", value: 50, min: 0, max: 100, unit: "%" },
        { id: "career-growth", label: "Career Growth", value: 50, min: 0, max: 100, unit: "%" },
    ]

    const defaultOutcomes = [
        { id: "financial", label: "Financial Stability", value: 50, rangeMin: 40, rangeMax: 60, trend: "stable" as const },
        { id: "happiness", label: "Work-Life Balance", value: 50, rangeMin: 40, rangeMax: 60, trend: "stable" as const },
        { id: "growth", label: "Career Advancement", value: 50, rangeMin: 40, rangeMax: 60, trend: "stable" as const },
    ]

    const handleCreateNew = () => {
        setViewMode("new")
    }

    const handleViewSimulation = (id: string) => {
        setSelectedSimulationId(id)
        setViewMode("detail")
    }

    const handleBack = () => {
        setViewMode("list")
        setSelectedSimulationId(null)
    }

    if (viewMode === "new" || viewMode === "detail") {
        return (
            <div className="space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={handleBack} className="cursor-pointer">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={handleBack} className="cursor-pointer">Change Jobs</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{viewMode === "new" ? "New Simulation" : "Simulation Details"}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <SimulationPanel
                    title={viewMode === "new" ? "New Job Simulation" : "Corporate Pivot 2024"} // Hardcoded title for now if detail
                    description="Adjust the factors below to see how they impact your life trajectory."
                    factors={defaultFactors}
                    outcomes={defaultOutcomes}
                    onBack={handleBack}
                />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Change Jobs</h1>
                    <p className="mt-2 text-muted-foreground">
                        Explore financial and career impact of switching positions.
                    </p>
                </div>
                <Button onClick={handleCreateNew} className="gradient-primary text-white shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" />
                    New Simulation
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {simulations.map(sim => (
                    <SimulationCard
                        key={sim.id}
                        title={sim.title}
                        date={sim.date}
                        status={sim.status}
                        inputs={sim.inputs}
                        outcome={sim.outcome}
                        onView={() => handleViewSimulation(sim.id)}
                        onEdit={() => handleViewSimulation(sim.id)}
                        onDelete={() => { }}
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
                    <h3 className="font-semibold text-foreground group-hover:text-primary">Create Empty Scenario</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Start from scratch with default values</p>
                </button>
            </div>
        </div>
    )
}
