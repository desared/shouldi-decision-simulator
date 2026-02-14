"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FirestoreProvider } from "@/contexts/firestore-context"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
            if (!currentUser || !currentUser.emailVerified) {
                router.push('/')
            }
        })
        return () => unsubscribe()
    }, [router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <FirestoreProvider user={user}>
            <div className="min-h-screen bg-background">
                <DashboardHeader user={user} />
                <main className="flex-1 overflow-y-auto bg-muted/20 p-6 lg:p-10">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </FirestoreProvider>
    )
}
