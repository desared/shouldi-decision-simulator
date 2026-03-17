"use client"

import { useState } from "react"
import { AlertTriangle, CreditCard, Trash2, Palette, Globe, ArrowUpRight } from "lucide-react"
import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { User, deleteUser } from "firebase/auth"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cancelSubscriptionAction } from "@/app/actions/stripe"

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    userPlan?: "free" | "pro"
    paidScenarioCredits?: number
    cancelAtPeriodEnd?: boolean
    currentPeriodEnd?: number
    onSubscriptionChange?: () => Promise<void>
}

export function SettingsDialog({
    open,
    onOpenChange,
    user,
    userPlan = "free",
    paidScenarioCredits = 0,
    cancelAtPeriodEnd = false,
    currentPeriodEnd,
    onSubscriptionChange,
}: SettingsDialogProps) {
    const t = useTranslations('dashboard')
    const router = useRouter()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isCanceling, setIsCanceling] = useState(false)
    const [cancelError, setCancelError] = useState<string | null>(null)

    const handleCancelSubscription = async () => {
        if (!user) return
        setIsCanceling(true)
        setCancelError(null)
        try {
            const result = await cancelSubscriptionAction(user.uid)
            if (result.error) {
                setCancelError(result.error)
            } else {
                setCancelDialogOpen(false)
                if (onSubscriptionChange) await onSubscriptionChange()
            }
        } catch {
            setCancelError(t('settings.cancelError'))
        } finally {
            setIsCanceling(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!user) return

        setIsDeleting(true)
        try {
            await deleteUser(user)
            router.push('/')
        } catch (error: unknown) {
            console.error("Error deleting account:", error)
            if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/requires-recent-login') {
                alert(t('settings.reAuthRequired'))
            } else {
                alert(t('settings.deleteError'))
            }
        } finally {
            setIsDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    const formatPeriodEnd = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('settings.title')}</DialogTitle>
                        <DialogDescription>
                            {t('settings.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Account Info */}
                        <div className="rounded-lg border border-border p-4">
                            <h4 className="text-sm font-medium text-foreground mb-2">{t('settings.account')}</h4>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>

                        {/* Preferences — only shown on mobile (desktop has these in the header) */}
                        <div className="md:hidden rounded-lg border border-border p-4 space-y-3">
                            <h4 className="text-sm font-medium text-foreground">{t('settings.preferences')}</h4>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Palette className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{t('settings.theme')}</span>
                                </div>
                                <ThemeToggle />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{t('settings.language')}</span>
                                </div>
                                <LanguageSwitcher />
                            </div>
                        </div>

                        {/* Subscription Section */}
                        <div className="rounded-lg border border-border p-4">
                            <div className="flex items-start gap-3">
                                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-foreground">{t('settings.subscription')}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t('settings.currentPlan')}: <span className="font-medium text-foreground">{userPlan === "pro" ? "Pro" : t('settings.freePlan')}</span>
                                    </p>
                                    {paidScenarioCredits > 0 && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {t('settings.scenarioCredits')}: <span className="font-medium text-foreground">{paidScenarioCredits}</span>
                                        </p>
                                    )}
                                    {/* Cancellation pending notice */}
                                    {userPlan === "pro" && cancelAtPeriodEnd && currentPeriodEnd && (
                                        <div className="mt-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 px-3 py-2">
                                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                                {t('settings.cancelsOn', { date: formatPeriodEnd(currentPeriodEnd) })}
                                            </p>
                                        </div>
                                    )}
                                    {userPlan === "free" && (
                                        <Button
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => {
                                                onOpenChange(false)
                                                setUpgradeDialogOpen(true)
                                            }}
                                        >
                                            <ArrowUpRight className="mr-2 h-4 w-4" />
                                            {t('settings.upgradeToPro')}
                                        </Button>
                                    )}
                                    {userPlan === "pro" && !cancelAtPeriodEnd && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => setCancelDialogOpen(true)}
                                        >
                                            {t('settings.cancelSubscription')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-destructive">{t('settings.dangerZone')}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t('settings.deleteWarning')}
                                    </p>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('settings.deleteAccount')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cancel Subscription Confirmation */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('settings.cancelConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('settings.cancelConfirmDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {cancelError && (
                        <p className="text-sm text-destructive">{cancelError}</p>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('settings.keepSubscription')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelSubscription}
                            disabled={isCanceling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isCanceling ? t('settings.canceling') : t('settings.confirmCancel')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Account Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('settings.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('settings.deleteConfirmDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? t('settings.deleting') : t('settings.confirmDelete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
        </>
    )
}
