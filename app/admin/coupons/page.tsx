import { Tag } from 'lucide-react'
import React from 'react'

const CouponPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background px-4'>
      <div className='max-w-md w-full bg-card rounded-lg shadow-lg p-8 border border-border'>
        <div className='space-y-4'>
          <div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2'>
            <Tag/>
          </div>

          <h1 className='text-2xl font-semibold text-foreground tracking-tight text-center'>
            Coupon Page
          </h1>

          <div className='flex items-center justify-center gap-2'>
            <span className='inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse'></span>
            <span className='text-sm text-muted-foreground'>Under Construction</span>
          </div>

          <p className='text-muted-foreground text-sm text-center leading-relaxed'>
            This page is currently being built. 
            <br />
            Check back soon for updates!
          </p>

          <div className='mt-4 w-full bg-muted rounded-full h-2 max-w-xs mx-auto overflow-hidden'>
            <div 
              className='bg-primary h-2 rounded-full transition-all duration-1000' 
              style={{ width: '35%' }}
            ></div>
          </div>

          <div className='flex items-center justify-center gap-2 mt-3'>
            <span className='text-xs text-muted-foreground'>Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CouponPage