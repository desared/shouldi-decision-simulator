"use client"

import { useState } from "react"
import { Sparkles, Settings, LogOut, User as UserIcon } from "lucide-react"
import { useTranslations } from 'next-intl'
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { SettingsDialog } from "./settings-dialog"

interface DashboardHeaderProps {
    user: User | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const t = useTranslations('dashboard')
    const [settingsOpen, setSettingsOpen] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await signOut(auth)
            router.push('/')
        } catch (error) {
            console.error("Error signing out", error)
        }
    }

    return (
        <>
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-lg">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-foreground">should<span className="text-primary">i</span></span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <ThemeToggle />
                    <LanguageSwitcher />

                    <div className="hidden md:block h-6 w-px bg-border" />

                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm font-medium text-muted-foreground md:inline-block">
                            {user?.displayName || user?.email?.split('@')[0] || "User"}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9 border border-border">
                                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                                        <AvatarFallback>
                                            <UserIcon className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>{t('settings.title')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{t('logout')}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} user={user} />
        </>
    )
}
