'use client'

import { useCartStore } from '@/store/cart-store'
import { CartItem } from '@/components/storefront/cart-item'
import { CartSummary } from '@/components/storefront/cart-summary'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const items = useCartStore((state) => state.items)

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
        <p className="mb-6 text-muted-foreground">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  )
}