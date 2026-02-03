"use client"

import React, { useState } from "react"
import { Briefcase, MapPin, Baby, Plus, FolderOpen, Trash2, MoreHorizontal, Home, TrendingUp, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { cn } from "@/lib/utils"
import { useFirestore } from "@/contexts/firestore-context"

const iconMap: Record<string, React.ElementType> = {
    briefcase: Briefcase,
    "map-pin": MapPin,
    baby: Baby,
    folder: FolderOpen,
    home: Home,
    "trending-up": TrendingUp,
    sun: Sun,
}

export function DashboardSidebar() {
    const {
        scenarios,
        selectedScenario,
        selectScenario,
        createScenario,
        deleteScenario,
        scenariosLoading,
    } = useFirestore()

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newScenarioTitle, setNewScenarioTitle] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null)

    const handleCreateScenario = async () => {
        if (!newScenarioTitle) return

        setIsCreating(true)
        try {
            const scenario = [
                { title: "Change Career", icon: "briefcase" },
                { title: "Buy a Home", icon: "home" },
                { title: "Start a Business", icon: "trending-up" },
                { title: "Relocate", icon: "map-pin" },
                { title: "Have a Child", icon: "baby" },
                { title: "Retire Early", icon: "sun" },
            ].find(s => s.title === newScenarioTitle)

            const icon = scenario ? scenario.icon : "folder"

            await createScenario(newScenarioTitle, "Custom scenario", icon)
            setNewScenarioTitle("")
            setIsAddDialogOpen(false)
        } catch (error) {
            console.error("Failed to create scenario:", error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteScenario = async () => {
        if (!scenarioToDelete) return

        try {
            await deleteScenario(scenarioToDelete)
        } catch (error) {
            console.error("Failed to delete scenario:", error)
        } finally {
            setScenarioToDelete(null)
            setDeleteDialogOpen(false)
        }
    }

    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 flex-col border-r border-border bg-card/30 lg:flex">
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Life Scenarios
                    </h3>
                </div>

                {scenariosLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : (
                    <div className="space-y-1">
                        {scenarios.map((scenario) => {
                            const Icon = iconMap[scenario.icon] || FolderOpen
                            const isActive = selectedScenario?.id === scenario.id

                            return (
                                <div
                                    key={scenario.id}
                                    className={cn(
                                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                                        isActive
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                    onClick={() => selectScenario(scenario.id)}
                                >
                                    <Icon
                                        className={cn(
                                            "h-4 w-4",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                    />
                                    <div className="flex flex-1 flex-col items-start gap-0.5">
                                        <span>{scenario.title}</span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {scenario.simulationCount} simulation{scenario.simulationCount !== 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    {!scenario.isDefault && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setScenarioToDelete(scenario.id)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="mt-6">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 border-dashed text-muted-foreground hover:text-foreground"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Scenario
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Scenario</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { title: "Change Jobs", icon: "briefcase" },
                                        { title: "Move to a New City", icon: "map-pin" },
                                        { title: "Buy vs Rent", icon: "home" },
                                    ].map((scenario) => (
                                        <Button
                                            key={scenario.title}
                                            variant={newScenarioTitle === scenario.title ? "default" : "outline"}
                                            className="h-auto flex-col gap-2 py-4"
                                            onClick={() => setNewScenarioTitle(scenario.title)}
                                        >
                                            <div className="rounded-full bg-background p-2 text-foreground">
                                                {iconMap[scenario.icon] ? (
                                                    React.createElement(iconMap[scenario.icon], { className: "h-4 w-4" })
                                                ) : (
                                                    <FolderOpen className="h-4 w-4" />
                                                )}
                                            </div>
                                            <span className="text-xs">{scenario.title}</span>
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    onClick={handleCreateScenario}
                                    disabled={!newScenarioTitle || isCreating}
                                    className="w-full"
                                >
                                    {isCreating ? "Creating..." : "Create Selected Scenario"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Scenario?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this scenario and all its simulations. This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteScenario}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="border-t border-border p-4">
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                    <h4 className="mb-1 text-sm font-semibold text-primary">Pro Features</h4>
                    <p className="text-xs text-muted-foreground">Unlock unlimited simulations and AI insights.</p>
                    <Button size="sm" className="mt-3 w-full gradient-primary text-white">
                        Upgrade Plan
                    </Button>
                </div>
            </div>
        </aside>
    )
}
