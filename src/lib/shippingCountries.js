export function isInternationalCountry(countryCode = 'ID') {
  return String(countryCode || 'ID').toUpperCase() !== 'ID'
}

export function getCountryLabel(countries = [], countryCode = 'ID') {
  const match = countries.find((country) => country.code === countryCode)

  return match?.label || countryCode
}

export function isShippingDestinationReady(checkoutForm) {
  if (checkoutForm.fulfillment !== 'delivery') {
    return false
  }

  const countryCode = String(checkoutForm.countryCode || 'ID').toUpperCase()

  if (countryCode !== 'ID') {
    return Boolean(
      countryCode &&
        checkoutForm.cityName?.trim() &&
        checkoutForm.postalCode?.trim(),
    )
  }

  return Boolean(
    checkoutForm.provinceCode?.trim() &&
      checkoutForm.cityCode?.trim() &&
      checkoutForm.districtCode?.trim(),
  )
}
