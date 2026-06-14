'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'

export function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const clearCart = useCartStore((state) => state.clearCart)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      toast({
        title: 'Error',
        description: 'Stripe is not initialized. Please try again.',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
        redirect: 'if_required',
      })
      
      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message,
          variant: 'destructive',
        })
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        clearCart()
        toast({
          title: 'Payment Successful!',
          description: 'Your order has been placed.',
        })
        router.push('/order-success')
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || !elements || isLoading}
        size="lg"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  )
}