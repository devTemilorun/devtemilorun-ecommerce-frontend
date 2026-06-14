'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { XCircle, ShoppingBag, Home } from 'lucide-react'
import Link from 'next/link'

export default function OrderFailedPage() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <h1 className="mb-2 text-2xl font-bold">Payment Failed</h1>
          <p className="mb-6 text-muted-foreground">
            Your payment could not be processed. Please try again or contact support.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/cart">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Return to Cart
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}