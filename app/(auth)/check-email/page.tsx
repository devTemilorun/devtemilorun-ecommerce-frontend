'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Mail, Loader2, RefreshCw } from 'lucide-react'
import api from '@/lib/axios'
import Link from 'next/link'

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const email = searchParams.get('email') || ''
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    if (!email) return
    setIsResending(true)
    try {
      await api.post('/auth/resend-verification', { email })
      setResent(true)
      toast({
        title: 'Email resent!',
        description: 'Check your inbox (and spam folder).',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to resend. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4">
              <Mail className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to your inbox
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {email && (
            <div className="bg-muted rounded-lg px-4 py-3">
              <p className="text-sm text-muted-foreground">Verification sent to:</p>
              <p className="font-semibold text-foreground">{email}</p>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1 text-left bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="font-medium text-amber-800 dark:text-amber-200"> Next steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-300">
              <li>Open your Gmail / email app</li>
              <li>Find the email from us</li>
              <li>Click the <strong>"Verify Email Address"</strong> button</li>
              <li>You'll be logged in automatically</li>
            </ol>
          </div>

          {resent && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
              New verification email sent! Check your inbox.
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Didn't receive it? Check your spam folder, or resend below.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            variant="outline"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend verification email
              </>
            )}
          </Button>

          <Link href="/login" className="text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="container flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  )
}