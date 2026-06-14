'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { orderService } from '@/services/api/order.service'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  onSuccess: (clientSecret: string) => void
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { items } = useCartStore()
  const { user } = useAuthStore()
  const { toast } = useToast()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
    },
  })

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true)
    
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        address: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address_line1: data.address,
          city: data.city,
          state: data.state,
          postal_code: data.zipCode,
          country: data.country,
        },
      }
      
      const response = await orderService.createOrder(orderData)
      onSuccess(response.client_secret)
      
      toast({
        title: 'Order created',
        description: 'Proceed with payment to complete your order.',
      })
    } catch (error) { 
      toast({
        title: 'Error',
        description: 'Failed to create order. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...register('firstName')} />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...register('lastName')} />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )} 
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register('state')} />
          {errors.state && (
            <p className="text-sm text-red-500">{errors.state.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input id="zipCode" {...register('zipCode')} />
          {errors.zipCode && (
            <p className="text-sm text-red-500">{errors.zipCode.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} />
          {errors.country && (
            <p className="text-sm text-red-500">{errors.country.message}</p>
          )}
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Place Order'}
      </Button>
    </form>
  )
}