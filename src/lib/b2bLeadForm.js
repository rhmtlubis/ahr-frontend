const MIN_B2B_QUANTITY = 5

export function parseB2bQuantity(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const normalized = String(value).replace(/[^\d]/g, '')
  if (!normalized) {
    return null
  }

  const quantity = Number.parseInt(normalized, 10)
  return Number.isFinite(quantity) ? quantity : null
}

export function validateB2bQuantity(value) {
  const quantity = parseB2bQuantity(value)

  if (quantity === null) {
    return 'Isi estimasi jumlah pcs (minimal 5 pcs).'
  }

  if (quantity < MIN_B2B_QUANTITY) {
    return `Minimal order ${MIN_B2B_QUANTITY} pcs untuk jalur B2B.`
  }

  return null
}

export function formatB2bQuantity(value) {
  const quantity = parseB2bQuantity(value)
  return quantity === null ? '' : String(quantity)
}
