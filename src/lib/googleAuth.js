import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBackendUrl } from './api'

export function isGoogleAuthEnabled() {
  return import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true'
}

export function getCustomerGoogleAuthUrl(returnPath = '/account') {
  const params = new URLSearchParams({ return_to: returnPath })

  return getBackendUrl(`/api/customer/auth/google/redirect?${params.toString()}`)
}

export function useGoogleAuthCallback({ refreshCustomer, setCustomer, onStatus }) {
  const location = useLocation()
  const navigate = useNavigate()
  const onStatusRef = useRef(onStatus)

  onStatusRef.current = onStatus

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const auth = params.get('auth')

    if (!auth?.startsWith('google')) {
      return
    }

    const needsPhone = params.get('needs_phone') === '1'
    params.delete('auth')
    params.delete('needs_phone')

    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : '',
      },
      { replace: true },
    )

    if (auth === 'google_error') {
      onStatusRef.current?.({
        state: 'error',
        needsPhone: false,
      })

      return
    }

    refreshCustomer()
      .then((customer) => {
        if (customer) {
          setCustomer?.(customer)
        }

        onStatusRef.current?.({
          state: 'success',
          needsPhone: needsPhone || Boolean(customer?.needs_phone),
          customer,
        })
      })
      .catch(() => {
        onStatusRef.current?.({
          state: 'error',
          needsPhone: false,
        })
      })
  }, [location.pathname, location.search, navigate, refreshCustomer, setCustomer])
}
