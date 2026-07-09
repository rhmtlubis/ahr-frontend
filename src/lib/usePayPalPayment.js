import { useCallback, useRef, useState } from 'react'
import { capturePayPalOrder, createPayPalOrder } from './api'

let paypalScriptLoaded = false
let paypalScriptLoading = false
let loadedPayPalClientId = ''
let loadedPayPalIsSandbox = null
const paypalLoadCallbacks = []

function resetPayPalScript() {
  paypalScriptLoaded = false
  paypalScriptLoading = false
  loadedPayPalClientId = ''
  loadedPayPalIsSandbox = null
  delete window.paypal

  document
    .querySelectorAll('script[src*="paypal.com/sdk/js"]')
    .forEach((script) => script.remove())
}

export function loadPayPalSdk(clientId, isSandbox = false) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'))
      return
    }

    if (!clientId) {
      reject(new Error('PayPal client ID belum dikonfigurasi'))
      return
    }

    const environmentChanged =
      loadedPayPalClientId !== clientId
      || loadedPayPalIsSandbox !== isSandbox

    if (environmentChanged) {
      resetPayPalScript()
    }

    if (window.paypal && paypalScriptLoaded) {
      resolve(window.paypal)
      return
    }

    paypalLoadCallbacks.push({ resolve, reject })

    if (paypalScriptLoading) {
      return
    }

    paypalScriptLoading = true

    const params = new URLSearchParams({
      'client-id': clientId,
      currency: 'USD',
      intent: 'capture',
      components: 'buttons',
    })

    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`
    script.async = true
    script.dataset.sdkIntegrationSource = 'button-factory'

    script.onload = () => {
      paypalScriptLoaded = true
      paypalScriptLoading = false
      loadedPayPalClientId = clientId
      loadedPayPalIsSandbox = isSandbox
      paypalLoadCallbacks.forEach((callback) => callback.resolve(window.paypal))
      paypalLoadCallbacks.length = 0
    }

    script.onerror = () => {
      paypalScriptLoading = false
      const error = new Error('Gagal memuat PayPal SDK')
      paypalLoadCallbacks.forEach((callback) => callback.reject(error))
      paypalLoadCallbacks.length = 0
    }

    document.body.appendChild(script)
  })
}

function ensurePayPalMount() {
  let mount = document.getElementById('paypal-button-mount')

  if (!mount) {
    mount = document.createElement('div')
    mount.id = 'paypal-button-mount'
    mount.style.position = 'fixed'
    mount.style.inset = '0'
    mount.style.zIndex = '9999'
    mount.style.display = 'flex'
    mount.style.alignItems = 'center'
    mount.style.justifyContent = 'center'
    mount.style.background = 'rgba(15, 23, 42, 0.55)'
    mount.style.padding = '24px'

    const panel = document.createElement('div')
    panel.id = 'paypal-button-panel'
    panel.style.background = '#fff'
    panel.style.borderRadius = '16px'
    panel.style.padding = '24px'
    panel.style.minWidth = 'min(360px, 92vw)'
    panel.style.boxShadow = '0 24px 64px rgba(15, 23, 42, 0.25)'

    const closeButton = document.createElement('button')
    closeButton.type = 'button'
    closeButton.textContent = '×'
    closeButton.setAttribute('aria-label', 'Close PayPal')
    closeButton.style.float = 'right'
    closeButton.style.border = '0'
    closeButton.style.background = 'transparent'
    closeButton.style.fontSize = '24px'
    closeButton.style.cursor = 'pointer'
    closeButton.addEventListener('click', () => {
      mount.remove()
    })

    const container = document.createElement('div')
    container.id = 'paypal-buttons-container'

    panel.appendChild(closeButton)
    panel.appendChild(container)
    mount.appendChild(panel)
    document.body.appendChild(mount)
  }

  return {
    mount,
    container: mount.querySelector('#paypal-buttons-container'),
    close: () => mount.remove(),
  }
}

export function usePayPalPayment() {
  const [isPayPalReady, setIsPayPalReady] = useState(false)
  const activeButtonsRef = useRef(null)

  const payOrder = useCallback(async (orderNumber, paymentAccessToken, callbacks = {}) => {
    const {
      onSuccess,
      onPending,
      onError,
      onClose,
    } = callbacks

    let mountUi = null

    try {
      const paypalData = await createPayPalOrder(orderNumber, paymentAccessToken)
      const paypal = await loadPayPalSdk(paypalData.client_id, paypalData.is_sandbox)
      setIsPayPalReady(true)

      mountUi = ensurePayPalMount()
      mountUi.container.innerHTML = ''

      await new Promise((resolve, reject) => {
        if (activeButtonsRef.current?.close) {
          activeButtonsRef.current.close()
        }

        const buttons = paypal.Buttons({
          createOrder: () => paypalData.paypal_order_id,
          onApprove: async (data) => {
            try {
              const captureResult = await capturePayPalOrder(
                orderNumber,
                paymentAccessToken,
                data.orderID,
              )

              mountUi.close()

              if (captureResult?.payment_status === 'paid') {
                onSuccess?.(captureResult)
                resolve(captureResult)
                return
              }

              onPending?.(captureResult)
              resolve(captureResult)
            } catch (error) {
              mountUi.close()
              onError?.(error)
              reject(error)
            }
          },
          onCancel: () => {
            mountUi.close()
            onClose?.()
            reject(new Error('PayPal payment cancelled'))
          },
          onError: (error) => {
            mountUi.close()
            onError?.(error)
            reject(error instanceof Error ? error : new Error('PayPal payment failed'))
          },
        })

        if (!buttons.isEligible()) {
          mountUi.close()
          const error = new Error('PayPal tidak tersedia di browser ini')
          onError?.(error)
          reject(error)
          return
        }

        activeButtonsRef.current = buttons
        buttons.render(mountUi.container)
      })
    } catch (error) {
      mountUi?.close()
      throw error
    }
  }, [])

  return {
    payOrder,
    isPayPalReady,
  }
}
