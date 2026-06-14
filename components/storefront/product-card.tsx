'use client'

import { Product } from '@/types/product.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import Image from 'next/image'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      productId: product.id,
      title: product.name,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      thumbnail: product.images?.[0] || '',
      stock: product.stock,
      description: product.description
    }
    addItem(cartItem as any)
  }

  // Only use image if it exists and is not empty
  const imageUrl = product.images?.[0] && product.images[0].trim() !== '' ? product.images[0] : null

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/shop/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
              <span className="mt-2 text-sm text-muted-foreground">No image</span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/shop/${product.id}`}>
          <h3 className="mb-2 line-clamp-2 font-semibold hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toFixed(2)}
          </span>
          {product.rating && product.rating > 0 && (
            <span className="flex items-center text-sm">
              <span className="text-yellow-500">★</span>
              <span className="ml-1">{typeof product.rating === 'string' ? parseFloat(product.rating).toFixed(1) : product.rating.toFixed(1)}</span>
            </span>
          )}
        </div>
        <Button 
          onClick={handleAddToCart} 
          className="w-full" 
          size="sm" 
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  )
}