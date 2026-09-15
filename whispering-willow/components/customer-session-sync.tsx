'use client'

import { useEffect } from 'react'
import { getCustomerAuthHeaders } from '@/lib/customer-browser'

export function CustomerSessionSync() {
  useEffect(() => {
    async function syncSession() {
      const headers = await getCustomerAuthHeaders()
      if (!headers.Authorization) return
      await fetch('/api/auth/session', { method: 'POST', headers })
    }

    void syncSession()
  }, [])

  return null
}
