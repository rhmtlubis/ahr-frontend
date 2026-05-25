const SHIPMENT_STEPS = [
  { key: 'paid', labelId: 'Pembayaran', labelEn: 'Payment' },
  { key: 'preparing', labelId: 'Disiapkan', labelEn: 'Preparing' },
  { key: 'pickup', labelId: 'Penjemputan', labelEn: 'Pickup' },
  { key: 'transit', labelId: 'Dalam perjalanan', labelEn: 'In transit' },
  { key: 'delivered', labelId: 'Terkirim', labelEn: 'Delivered' },
]

const STATUS_STEP_INDEX = {
  confirmed: 1,
  scheduled: 1,
  allocated: 2,
  picking_up: 2,
  picked: 2,
  in_transit: 3,
  dropping_off: 3,
  delivered: 4,
}

const PHASE_LABELS = {
  awaiting_payment: { id: 'Menunggu pembayaran', en: 'Awaiting payment' },
  awaiting_shipment: { id: 'Menunggu pengiriman', en: 'Awaiting shipment' },
  preparing: { id: 'Disiapkan', en: 'Preparing' },
  pickup: { id: 'Penjemputan kurir', en: 'Courier pickup' },
  in_transit: { id: 'Dalam perjalanan', en: 'In transit' },
  delivered: { id: 'Terkirim', en: 'Delivered' },
  cancelled: { id: 'Pengiriman dibatalkan', en: 'Shipment cancelled' },
  issue: { id: 'Perlu perhatian', en: 'Needs attention' },
}

export function getShipmentSteps(language) {
  return SHIPMENT_STEPS.map((step) => ({
    key: step.key,
    label: language === 'en' ? step.labelEn : step.labelId,
  }))
}

export function getShipmentActiveStepIndex({ phase, biteshipStatus, paidAt, orderStatus }) {
  if (phase === 'delivered' || biteshipStatus === 'delivered') {
    return 4
  }

  if (phase === 'cancelled' || phase === 'issue') {
    return STATUS_STEP_INDEX[biteshipStatus] ?? (paidAt ? 1 : 0)
  }

  if (biteshipStatus && STATUS_STEP_INDEX[biteshipStatus] !== undefined) {
    return STATUS_STEP_INDEX[biteshipStatus]
  }

  if (phase === 'pickup') {
    return 2
  }

  if (phase === 'preparing') {
    return 1
  }

  if (phase === 'in_transit') {
    return 3
  }

  if (phase === 'awaiting_shipment' || paidAt || orderStatus === 'confirmed' || orderStatus === 'processing') {
    return 1
  }

  if (phase === 'awaiting_payment' || orderStatus === 'pending_whatsapp') {
    return 0
  }

  return paidAt ? 1 : 0
}

export function getShipmentPhaseLabel(phase, language) {
  const labels = PHASE_LABELS[phase]

  if (!labels) {
    return null
  }

  return language === 'en' ? labels.en : labels.id
}

export function shouldShowShipmentTracking(order) {
  return order?.fulfillment_method === 'delivery' || Boolean(order?.shipment || order?.shipment_tracking)
}

export async function copyTrackingValue(value) {
  if (!value) {
    return false
  }

  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}
