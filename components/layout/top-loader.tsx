'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
// @ts-ignore: side-effect import for global CSS
import NProgress from 'nprogress'

export function TopLoader() {
  const pathname = usePathname()
  const isInitialMount = useRef(true)

  useEffect(() => {
    NProgress.configure({ showSpinner: false, trickleSpeed: 200, minimum: 0.08 })
  }, [])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    NProgress.start()

    const timeout = window.setTimeout(() => {
      NProgress.done()
    }, 700)

    return () => {
      window.clearTimeout(timeout)
      NProgress.done()
    }
  }, [pathname])

  return null
}
