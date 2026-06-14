
'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ShoppingBag, Home } from 'lucide-react'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart)
  const router = useRouter()

  useEffect(() => {
    // Clear cart when order is successful
    clearCart()
  }, [clearCart])

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <h1 className="mb-2 text-2xl font-bold">Payment Successful!</h1>
          <p className="mb-6 text-muted-foreground">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/orders">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View My Orders
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}