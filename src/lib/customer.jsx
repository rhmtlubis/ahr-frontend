/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ensureCsrfCookie, fetchCurrentCustomer } from './api'

const CustomerContext = createContext(null)

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

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
    }
  }, [])

  const value = useMemo(
    () => ({
      customer,
      isLoading,
      setCustomer,
    }),
    [customer, isLoading],
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
