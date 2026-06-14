'use client'

import { HeroSection } from '@/components/storefront/hero-section'
import { FeaturedProducts } from '@/components/storefront/featured-products'
import { CategoriesGrid } from '@/components/storefront/categories-grid'
import { Newsletter } from '@/components/storefront/newsletter'
import { motion } from 'framer-motion'
import { TrendingUp, Truck, Shield, Headphones } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free worldwide shipping on orders over $100',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure payment with Stripe',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer support team',
  },
  {
    icon: TrendingUp,
    title: 'Best Prices',
    description: 'Price match guarantee',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      
      <FeaturedProducts />
      
      <CategoriesGrid />
      
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <Newsletter />
    </div>
  )
}