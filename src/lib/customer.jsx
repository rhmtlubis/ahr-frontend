/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ensureCsrfCookie, fetchCurrentCustomer, setUnauthorizedHandler } from './api'

const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCustomer = useCallback(async () => {
    await ensureCsrfCookie()
    const currentCustomer = await fetchCurrentCustomer()
    setCustomer(currentCustomer)

    return currentCustomer
  }, [])

  useEffect(() => {
    let isActive = true

    setUnauthorizedHandler(() => {
      if (isActive) {
        setCustomer(null)
      }
    })

    ensureCsrfCookie()
      .then(() => fetchCurrentCustomer())
      .then((currentCustomer) => {
        if (!isActive) {
          return
        }

        setCustomer(currentCustomer)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setCustomer(null)
      })
      .finally(() => {
        if (!isActive) {
          return
        }

        setIsLoading(false)
      })

    return () => {
      isActive = false
      setUnauthorizedHandler(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      customer,
      isLoading,
      setCustomer,
      refreshCustomer,
    }),
    [customer, isLoading, refreshCustomer],
  )

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>
}

export function useCustomer() {
  const context = useContext(CustomerContext)

  if (!context) {
    throw new Error('useCustomer must be used inside CustomerProvider')
  }

  return context
}
