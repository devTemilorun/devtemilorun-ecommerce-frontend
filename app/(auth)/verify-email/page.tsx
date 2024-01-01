'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/axios'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { setToken, setUser } = useAuthStore()

  const email = searchParams?.get('email') || ''
  const token = searchParams?.get('token') || ''

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('verifying')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendEmail, setResendEmail] = useState(email || '')

  useEffect(() => {
    console.log('🔍 URL params:', { email, token, tokenLength: token?.length })

    if (token && token.length > 0 && email && email.length > 0) {
      verifyEmail()
    } else if (email && (!token || token.length === 0)) {
      console.log('Email only — showing check inbox message')
      setStatus('pending')
      setMessage(`We sent a verification link to ${email}. Click the link in your email to verify your account.`)
    } else if (!email && token) {
      setStatus('error')
      setMessage('Invalid verification link. Email is missing.')
    } else {
      setStatus('error')
      setMessage('No verification link provided. Please request a new one.')
    }
  }, [token, email])

  const verifyEmail = async () => {
    try {
      console.log('🔍 Sending verification request:', { email, token })

      const response = await api.post('/auth/verify-email', { email, token })

      console.log('Verification response:', response.data)

      if (response.data.verified) {
        setStatus('success')
        setMessage('Your email has been verified successfully! 🎉')

        if (response.data.token) {
          setToken(response.data.token)
          setUser(response.data.user)
        }

        toast({
          title: 'Success! ',
          description: 'Email verified successfully! Redirecting...',
        })

        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Verification error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })

      setStatus('error')

      if (error.response?.status === 400) {
        setMessage(error.response?.data?.message || 'Invalid verification token. Please request a new one.')
      } else if (error.response?.status === 404) {
        setMessage('User not found. Please register again.')
      } else {
        setMessage(error.response?.data?.message || 'Verification failed. Please try again.')
      }

      toast({
        title: 'Verification Failed',
        description: error.response?.data?.message || 'Invalid verification link',
        variant: 'destructive',
      })
    }
  }

  const handleResendVerification = async () => {
    if (!resendEmail) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      })
      return
    }

    setIsResending(true)
    try {
      await api.post('/auth/resend-verification', { email: resendEmail })
      setStatus('pending')
      setMessage(`A new verification email has been sent to ${resendEmail}. Please check your inbox and spam folder.`)

      toast({
        title: 'Success!',
        description: 'Verification email resent successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to resend verification email',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Verifying your email...</h3>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
            {email && (
              <p className="text-sm text-muted-foreground mt-2">Verifying: {email}</p>
            )}
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Email Verified! </h3>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to home page...</p>
          </div>
        )

      case 'pending':
        return (
          <div className="text-center py-8">
            <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Check your inbox</h3>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Can't find it? Check your spam folder or resend below.
            </p>
            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Verification Failed</h3>
            <p className="text-muted-foreground">{message}</p>

            {email && (
              <p className="text-sm text-muted-foreground mt-2">Email: {email}</p>
            )}

            <div className="mt-4 space-y-4">
              <div className="flex flex-col items-start gap-2">
                <label className="text-sm font-medium">Enter your email to resend:</label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/login')}
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === 'success'
              ? 'Your email has been verified'
              : status === 'error'
              ? 'Verification failed'
              : status === 'pending'
              ? 'Almost there!'
              : 'Verifying your email address'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}