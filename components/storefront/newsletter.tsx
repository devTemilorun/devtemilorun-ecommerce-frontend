"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Subscribed!',
      description: 'Thank you for subscribing to our newsletter.',
    })
    setEmail('')
  }

  return (
    <section className="bg-muted py-16">
      <div className="container text-center">
        <h2 className="mb-4 text-3xl font-bold">Stay Updated</h2>
        <p className="mb-6 text-muted-foreground">
          Subscribe to our newsletter for exclusive deals and updates.
        </p>
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </section>
  )
}