'use client'

import type { ReactNode } from 'react'
import { toast as sonnerToast } from 'sonner'

export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant = 'default',
    }: {
      title: string
      description?: ReactNode
      variant?: 'default' | 'destructive'
    }) => {
      if (variant === 'destructive') {
        sonnerToast.error(title, description ? { description } : undefined)
      } else {
        sonnerToast.success(title, description ? { description } : undefined)
      }
    },
  }
}