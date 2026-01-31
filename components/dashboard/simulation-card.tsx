"use client"

import { MoreHorizontal, Calendar, ArrowUpRight, ArrowDownRight, Minus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SimulationCardProps {
    title: string
    date: string
    inputs: { label: string; value: string }[]
    outcome: { label: string; value: string; trend: "positive" | "negative" | "neutral" }
    status: "optimal" | "moderate" | "risk"
    onView: () => void
    onEdit: () => void
    onDelete: () => void
}

export function SimulationCard({ title, date, inputs, outcome, status, onView, onEdit, onDelete }: SimulationCardProps) {
    const statusConfig = {
        optimal: { label: "Optimal Choice", color: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20" },
        moderate: { label: "Moderate Risk", color: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" },
        risk: { label: "High Risk", color: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20" },
    }

    return (
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md">
            <div className="p-5">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={cn("border-0 text-[10px] font-medium tracking-wide uppercase", statusConfig[status].color)}>
                                {statusConfig[status].label}
                            </Badge>
                        </div>
                        <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{title}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Saved {date}</span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={onView}>View Report</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mb-4 space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
                    {inputs.map((input, i) => (
                        <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">{input.label}</span>
                            <span className="font-medium">{input.value}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Key Outcome</span>
                        <span className="text-sm font-semibold">{outcome.label}</span>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                        outcome.trend === "positive" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            outcome.trend === "negative" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    )}>
                        <span>{outcome.value}</span>
                        {outcome.trend === "positive" && <ArrowUpRight className="h-3 w-3" />}
                        {outcome.trend === "negative" && <ArrowDownRight className="h-3 w-3" />}
                        {outcome.trend === "neutral" && <Minus className="h-3 w-3" />}
                    </div>
                </div>
            </div>

            <div className="flex border-t border-border bg-muted/20">
                <button
                    onClick={onView}
                    className="flex flex-1 items-center justify-center gap-2 border-r border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <FileText className="h-3.5 w-3.5" />
                    View Details
                </button>
                <button
                    onClick={onEdit}
                    className="flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    Edit Scenarios
                </button>
            </div>
        </div>
    )
}
