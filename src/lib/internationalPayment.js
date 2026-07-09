import { isInternationalCountry } from './shippingCountries'

export function getInternationalPaymentConfig(storePromo) {
  return (
    storePromo?.international_payment || {
      mode: 'paypal_only',
      channels: ['paypal'],
      default_channel: 'paypal',
      midtrans_usd_ready: false,
      paypal_ready: Boolean(storePromo?.paypal?.enabled),
    }
  )
}

export function isInternationalCheckout(checkoutForm) {
  return checkoutForm.fulfillment === 'delivery' && isInternationalCountry(checkoutForm.countryCode)
}

export function getAvailableInternationalChannels(storePromo) {
  return getInternationalPaymentConfig(storePromo).channels || []
}

export function shouldShowInternationalPaymentPicker(storePromo) {
  const config = getInternationalPaymentConfig(storePromo)

  return config.mode === 'paypal_and_midtrans' && (config.channels?.length || 0) > 1
}

export function resolvePaymentChannel(checkoutForm, storePromo, selectedInternationalChannel = null) {
  if (!isInternationalCheckout(checkoutForm)) {
    return 'midtrans'
  }

  const config = getInternationalPaymentConfig(storePromo)
  const available = config.channels || []

  if (selectedInternationalChannel && available.includes(selectedInternationalChannel)) {
    return selectedInternationalChannel
  }

  if (available.includes(config.default_channel)) {
    return config.default_channel
  }

  return available[0] || 'paypal'
}

export function isPayPalPaymentChannel(channel) {
  return channel === 'paypal'
}
