'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  Shield, 
  Headphones, 
  Award, 
  Clock, 
  Users, 
  TrendingUp,
  Star,
  Heart,
  Globe,
  RefreshCw,
  ShoppingBag,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  const stats = [
    { value: '50K+', label: 'Happy Customers', icon: Users },
    { value: '500+', label: 'Premium Products', icon: ShoppingBag },
    { value: '30+', label: 'Countries Served', icon: Globe },
    { value: '99.9%', label: 'Satisfaction Rate', icon: Star },
  ]

  const features = [
    {
      icon: Truck,
      title: 'Free Express Shipping',
      description: 'On all orders over $100. Delivery within 2-3 business days.',
      color: 'blue',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: '256-bit SSL encryption & PCI compliant. Your data is safe.',
      color: 'green',
    },
    {
      icon: Headphones,
      title: '24/7 Priority Support',
      description: 'Dedicated support team available anytime, anywhere.',
      color: 'purple',
    },
    {
      icon: RefreshCw,
      title: '30-Day Returns',
      description: 'Not satisfied? Full refund within 30 days. No questions asked.',
      color: 'orange',
    },
    {
      icon: Award,
      title: 'Quality Guarantee',
      description: 'Every product is hand-picked and tested for quality.',
      color: 'red',
    },
    {
      icon: Clock,
      title: 'Instant Updates',
      description: 'Real-time order tracking and notifications.',
      color: 'teal',
    },
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      bio: 'Former Amazon executive with 15+ years in e-commerce',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      bio: 'Tech innovator passionate about seamless shopping experiences',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      bio: 'Award-winning designer focused on user-centric experiences',
    },
    {
      name: 'David Kim',
      role: 'Customer Success',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      bio: 'Dedicated to making every customer smile',
    },
  ]

  const milestones = [
    { year: '2024', title: 'Company Founded', description: 'Started with a vision to transform online shopping' },
    { year: '2024', title: '10K Customers', description: 'Reached 10,000 happy customers worldwide' },
    { year: '2025', title: 'Global Expansion', description: 'Launched in 30+ countries across 3 continents' },
    { year: '2025', title: 'Industry Award', description: 'Recognized as Best E-commerce Platform' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section with Parallax Effect */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background py-24">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-2">
              <Heart className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Built with passion</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Crafting the Future
              <span className="block bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                of E-commerce
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              We're on a mission to create the most seamless, enjoyable, and trustworthy
              shopping experience for millions of customers worldwide.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/shop">
                  Start Shopping
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
                Our Story
              </div>
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
                More Than Just a
                <span className="text-primary"> Shopping Platform</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2024, ModernStore emerged from a simple observation: online shopping
                  should be effortless, exciting, and trustworthy. We saw an opportunity to build
                  something better—a platform that puts customers first.
                </p>
                <p>
                  What started as a small team of 5 passionate individuals has grown into a
                  global community of over 50 employees, serving thousands of satisfied customers
                  across 30+ countries.
                </p>
                <p>
                  Today, we're proud to be one of the fastest-growing e-commerce platforms,
                  known for our curated selection of premium products, exceptional customer service,
                  and innovative technology.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold">500% Growth</div>
                    <div className="text-xs text-muted-foreground">in first year</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
                    <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold">4.9 Rating</div>
                    <div className="text-xs text-muted-foreground">from 10K+ reviews</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=600&fit=crop"
                    alt="Team working"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=600&fit=crop"
                    alt="Warehouse"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="pt-12">
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=600&fit=crop"
                    alt="Customer service"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/30 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
              Why Choose Us
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need for
              <span className="text-primary"> a Perfect Experience</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We've packed ModernStore with features that make shopping delightful,
              secure, and convenient.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="group transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Our Journey</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From humble beginnings to industry leader
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-border md:block" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex flex-col md:flex-row ${
                  index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
                }`}>
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <Card className="transition-all hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="mb-2 text-2xl font-bold text-primary">{milestone.year}</div>
                        <h3 className="mb-2 text-xl font-semibold">{milestone.title}</h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/30 py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
              The Dream Team
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Meet the People Behind
              <span className="text-primary"> ModernStore</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Passionate individuals dedicated to revolutionizing your shopping experience
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden transition-all hover:shadow-xl">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="mb-1 text-xl font-semibold">{member.name}</h3>
                  <p className="mb-3 text-sm text-primary">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="relative p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Ready to Start Your Journey?</h2>
              <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
                Join thousands of happy customers who trust ModernStore for their shopping needs
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <Link href="/shop">
                    Shop Now
                    <ShoppingBag className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">
                    Contact Sales
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}