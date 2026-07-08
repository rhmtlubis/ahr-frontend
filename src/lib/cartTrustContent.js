import { getCssCartShippingNote, getCssTrustItems } from './cssStoreConfig'
import { isCssStore } from './storeConfig'

export function getRetailTrustItems(locale = 'id') {
  const isEnglish = locale === 'en'

  return [
    {
      id: 'midtrans',
      label: isEnglish ? 'Secure payment via Midtrans' : 'Pembayaran aman via Midtrans',
    },
    {
      id: 'production',
      label: isEnglish ? 'Produced by AHR Corporation' : 'Produksi AHR Corporation',
    },
    {
      id: 'shipping',
      label: isEnglish ? 'Indonesia & international delivery' : 'Pengiriman Indonesia & internasional',
    },
    {
      id: 'lead-time',
      label: isEnglish ? 'Production ±3 business days' : 'Produksi ±3 hari kerja',
    },
  ]
}

export function getRetailCartShippingNote(locale = 'id') {
  return locale === 'en'
    ? 'Shipping cost is calculated after you enter your delivery address at checkout. Free Jabodetabek shipping may apply to eligible orders.'
    : 'Biaya ongkir dihitung setelah alamat pengiriman diisi di checkout. Gratis ongkir Jabodetabek berlaku untuk order yang memenuhi syarat.'
}

export function getCartTrustItems(locale = 'id') {
  return isCssStore() ? getCssTrustItems(locale) : getRetailTrustItems(locale)
}

export function getCartShippingNote(locale = 'id') {
  return isCssStore() ? getCssCartShippingNote(locale) : getRetailCartShippingNote(locale)
}
