"use client"

import { useState, useEffect } from "react"
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
  sendEmailVerification,
  signOut,
  AuthError
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { createUserProfileIfNotExists, seedDefaultScenarios } from "@/lib/firestore-service"
import { Loader2, Mail } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const t = useTranslations('auth')
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
      setError(null)
      setVerificationSent(false)
    }
  }, [isOpen, defaultMode])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await sendEmailVerification(userCredential.user)
        await signOut(auth)
        setVerificationSent(true)
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        if (!userCredential.user.emailVerified) {
          await signOut(auth)
          setError(t('emailNotVerified'))
          return
        }

        // Create user profile and seed default scenarios
        await createUserProfileIfNotExists(userCredential.user.uid, {
          email: userCredential.user.email || "",
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
        })
        await seedDefaultScenarios(userCredential.user.uid)

        onClose()
      }
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
      const result = await signInWithPopup(auth, googleProvider)

      // Create user profile and seed default scenarios
      await createUserProfileIfNotExists(result.user.uid, {
        email: result.user.email || "",
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      })
      await seedDefaultScenarios(result.user.uid)

      onClose()
    } catch (err) {
      console.error(err)
      setError("Google sign in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setVerificationSent(false)
    setMode('signin')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
  }

  if (verificationSent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl mb-2">
                {t('verificationSentTitle')}
              </DialogTitle>
              <DialogDescription className="text-base">
                {t('verificationSentMessage')}
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={handleBackToLogin}
              className="mt-6 gradient-primary text-white"
            >
              {t('loginButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
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

        <div className="py-4">
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
