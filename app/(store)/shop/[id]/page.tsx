'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { productService } from '@/services/api/product.service'
import { ProductGallery } from '@/components/storefront/product-gallery'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/hooks/use-toast'
import { ShoppingCart, Heart, Share2, Star } from 'lucide-react'
import { ProductGrid } from '@/components/storefront/product-grid'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => productService.getProduct(Number(params.id)),
  })

  const { data: relatedProductsData } = useQuery({
    queryKey: ['related-products', product?.category_id],
    queryFn: () => productService.getProducts({ 
      category: product?.category?.slug,
      limit: 4 
    }),
    enabled: !!product,
  })

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-500">Product not found</p>
          <Button className="mt-4" onClick={() => window.location.href = '/shop'}>
            Back to Shop
          </Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      thumbnail: product.images?.[0] || product.thumbnail || '',
      stock: product.stock,
      description: product.description,
      quantity: 1
    }
    addItem(cartItem as any)
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    })
  }

  // Get related products - safely handle undefined
  const relatedProducts = relatedProductsData?.data || []
  
  // Get category name safely
  const categoryName = product.category?.name || 'Uncategorized'
  
  // Get images array safely - filter out undefined/null values
  const productImages = (product.images || []).filter((img): img is string => 
    img !== null && img !== undefined && img !== ''
  )
  
  // If no images, use thumbnail if available
  if (productImages.length === 0 && product.thumbnail) {
    productImages.push(product.thumbnail)
  }

  // Calculate discount percentage
  const discountPercentage = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  // Get rating safely
  const rating = typeof product.rating === 'number' ? product.rating : 0

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Gallery */}
        <ProductGallery 
          images={productImages} 
          title={product.name} 
        />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground">{categoryName}</div>
            <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="border-t border-b py-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ${(typeof product.price === 'string' ? parseFloat(product.price) : product.price).toFixed(2)}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${(typeof product.compare_price === 'string' ? parseFloat(product.compare_price) : product.compare_price).toFixed(2)}
                </span>
              )}
              {discountPercentage && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                  Save {discountPercentage}%
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {product.short_description && (
            <div>
              <h3 className="mb-2 font-semibold">Highlights</h3>
              <p className="text-muted-foreground">{product.short_description}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="flex-1" 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-semibold">Product Details</h4>
            <ul className="space-y-1 text-sm">
              <li><strong>SKU:</strong> {product.sku}</li>
              <li><strong>Category:</strong> {categoryName}</li>
              {product.weight && <li><strong>Weight:</strong> {product.weight} kg</li>}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <li><strong>Attributes:</strong> {JSON.stringify(product.attributes)}</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  )
}