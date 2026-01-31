"use client"

import { Briefcase, MapPin, Baby, Plus, FolderOpen, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"

interface SidebarItemProps {
    icon: React.ElementType
    label: string
    href?: string
    active?: boolean
    disabled?: boolean
    description?: string
}

function SidebarItem({ icon: Icon, label, href, active, disabled, description }: SidebarItemProps) {
    const Content = (
        <div className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            active
                ? "bg-accent text-accent-foreground"
                : disabled
                    ? "cursor-not-allowed opacity-60"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}>
            <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            <div className="flex flex-1 flex-col items-start gap-0.5">
                <span>{label}</span>
                {description && <span className="text-xs font-normal text-muted-foreground">{description}</span>}
            </div>
            {disabled && <Lock className="h-3 w-3 text-muted-foreground/50" />}
        </div>
    )

    if (href && !disabled) {
        return <Link href={href} className="w-full">{Content}</Link>
    }

    return <div className="w-full">{Content}</div>
}

export function DashboardSidebar() {
    const pathname = usePathname()
    const params = useParams()
    const locale = params.locale as string

    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 flex-col border-r border-border bg-card/30 lg:flex">
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Life Scenarios
                    </h3>
                </div>

                <div className="space-y-1">
                    <SidebarItem
                        icon={Briefcase}
                        label="Change Jobs"
                        href={`/${locale}/dashboard`}
                        active={pathname.includes("/dashboard") && !pathname.includes("relocation") && !pathname.includes("family")}
                        description="Career & Financial Impact"
                    />

                    <div className="my-2 border-t border-border/50" />

                    <SidebarItem
                        icon={MapPin}
                        label="Relocation"
                        disabled
                        description="Coming Soon"
                    />
                    <SidebarItem
                        icon={Baby}
                        label="Family Planning"
                        disabled
                        description="Coming Soon"
                    />
                </div>

                <div className="mt-6">
                    <Button variant="outline" className="w-full justify-start gap-2 border-dashed text-muted-foreground hover:text-foreground">
                        <Plus className="h-4 w-4" />
                        Add New Scenario
                    </Button>
                </div>
            </div>

            <div className="border-t border-border p-4">
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                    <h4 className="mb-1 text-sm font-semibold text-primary">Pro Features</h4>
                    <p className="text-xs text-muted-foreground">Unlock unlimited simulations and AI insights.</p>
                    <Button size="sm" className="mt-3 w-full gradient-primary text-white">Upgrade Plan</Button>
                </div>
            </div>
        </aside>
    )
}
