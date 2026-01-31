"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  AuthError
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const t = useTranslations('auth')
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      onClose()
    } catch (err: any) {
      console.error(err)
      if (err.message === "Passwords do not match") {
        setError(err.message)
      } else {
        const authError = err as AuthError
        // Simple error mapping
        if (authError.code === 'auth/invalid-credential') {
          setError("Invalid email or password")
        } else if (authError.code === 'auth/email-already-in-use') {
          setError("Email already in use")
        } else if (authError.code === 'auth/weak-password') {
          setError("Password should be at least 6 characters")
        } else {
          setError("Authentication failed. Please try again.")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      onClose()
    } catch (err) {
      console.error(err)
      setError("Google sign in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === 'signin' ? t('signInTitle') : t('signUpTitle')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' ? t('signInSubtitle') : t('signUpSubtitle')}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('password')}</Label>
              {mode === 'signin' && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  {t('forgotPassword')}
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <Button type="submit" className="w-full gradient-primary" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (mode === 'signin' ? t('signInTitle').split(' ')[0] : t('signUp'))}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('continueWith')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4">
          <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t('google')}
          </Button>
          <Button variant="outline" type="button" className="w-full" disabled={loading}>
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
            </svg>
            {t('apple')}
          </Button>
        </div>

        <div className="text-center text-sm">
          {mode === 'signin' ? (
            <>
              {t('noAccount')}{' '}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setMode('signup')}
                disabled={loading}
              >
                {t('signUp')}
              </button>
            </>
          ) : (
            <>
              {t('hasAccount')}{' '}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setMode('signin')}
                disabled={loading}
              >
                {t('signInTitle').split(' ')[0]}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
