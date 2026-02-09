"use client"

import { useTranslations } from "next-intl"
import { Check, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface UpgradeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
    const t = useTranslations('pricing')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                        {t('title')}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t('subtitle')}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:gap-4 py-2 sm:py-4 md:grid-cols-2">
                    {/* Pay Per Scenario */}
                    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                {t('perScenario.title')}
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            {t('perScenario.description')}
                        </p>
                        <div className="mb-3">
                            <span className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('perScenario.price')}
                            </span>
                            <span className="text-muted-foreground ml-2">
                                {t('perScenario.period')}
                            </span>
                        </div>
                        <ul className="mb-4 space-y-1.5">
                            {(t.raw('perScenario.features') as string[]).map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm text-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            disabled
                            className="w-full opacity-50 cursor-not-allowed"
                            variant="outline"
                        >
                            {t('perScenario.cta')}
                        </Button>
                    </div>

                    {/* Pro Monthly */}
                    <div className="relative rounded-xl border-2 border-primary bg-card p-4 sm:p-6 shadow-lg mt-2 md:mt-0">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="inline-flex items-center gap-1 rounded-full gradient-primary px-3 py-1 text-xs font-medium text-white">
                                <Sparkles className="h-3 w-3" />
                                {t('monthly.popular')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-foreground">
                                {t('monthly.title')}
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            {t('monthly.description')}
                        </p>
                        <div className="mb-3">
                            <span className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('monthly.price')}
                            </span>
                            <span className="text-muted-foreground ml-2">
                                {t('monthly.period')}
                            </span>
                        </div>
                        <ul className="mb-4 space-y-1.5">
                            {(t.raw('monthly.features') as string[]).map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm text-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            disabled
                            className="w-full opacity-50 cursor-not-allowed"
                            variant="outline"
                        >
                            {t('monthly.cta')}
                        </Button>
                    </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                    {t('freeTrial')} • {t('noCardRequired')}
                </p>
            </DialogContent>
        </Dialog>
    )
}
