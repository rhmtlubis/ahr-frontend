import {
  fetchCatalogCities,
  fetchCatalogDistricts,
  fetchCatalogProvinces,
  fetchCatalogShippingRates,
} from './api'
import { buildDisplayExchangeRate, formatCurrencyAmount, formatIdrMinorForDisplay } from './price'

let cachedLocationCodes = null
let cachedEstimateKey = ''
let cachedEstimateResult = null

const INTERNATIONAL_ESTIMATE_DESTINATION = {
  countryCode: 'SG',
  cityName: 'Singapore',
  stateRegion: 'Central Region',
  postalCode: '018956',
  destinationLabel: {
    en: 'Singapore (estimate only)',
    id: 'Singapura (estimasi saja)',
  },
}

function getItemUnitAmountMinor(item) {
  const pricing = item.product?.pricing || {}

  if (Number.isFinite(pricing.final_amount_minor)) {
    return pricing.final_amount_minor
  }

  if (Number.isFinite(pricing.original_amount_minor)) {
    return pricing.original_amount_minor
  }

  return null
}

function buildDomesticEstimatePayload(items, locationCodes) {
  return {
    country_code: 'ID',
    province_code: locationCodes.provinceCode,
    city_code: locationCodes.cityCode,
    district_code: locationCodes.districtCode,
    items: items.map((item) => ({
      product_slug: item.product.slug,
      product_name: item.product.name,
      product_category: item.product.category || null,
      quantity: item.quantity,
      expected_unit_amount_minor: getItemUnitAmountMinor(item),
      expected_original_unit_amount_minor: getItemUnitAmountMinor(item),
    })),
  }
}

function buildInternationalEstimatePayload(items) {
  return {
    country_code: INTERNATIONAL_ESTIMATE_DESTINATION.countryCode,
    city_name: INTERNATIONAL_ESTIMATE_DESTINATION.cityName,
    state_region: INTERNATIONAL_ESTIMATE_DESTINATION.stateRegion,
    postal_code: INTERNATIONAL_ESTIMATE_DESTINATION.postalCode,
    items: items.map((item) => ({
      product_slug: item.product.slug,
      product_name: item.product.name,
      product_category: item.product.category || null,
      quantity: item.quantity,
      expected_unit_amount_minor: getItemUnitAmountMinor(item),
      expected_original_unit_amount_minor: getItemUnitAmountMinor(item),
    })),
  }
}

function findJabodetabekProvince(provinces = []) {
  return (
    provinces.find((province) => /jakarta|dki/i.test(province.name || '')) ||
    provinces.find((province) => /bogor|depok|tangerang|bekasi|jabodetabek/i.test(province.name || '')) ||
    provinces[0] ||
    null
  )
}

async function resolveDefaultEstimateLocation() {
  if (cachedLocationCodes) {
    return cachedLocationCodes
  }

  const provinces = await fetchCatalogProvinces()
  const province = findJabodetabekProvince(provinces)

  if (!province?.code) {
    return null
  }

  const cities = await fetchCatalogCities(province.code)
  const city = cities[0]

  if (!city?.code) {
    return null
  }

  const districts = await fetchCatalogDistricts(city.code)
  const district = districts[0]

  if (!district?.code) {
    return null
  }

  cachedLocationCodes = {
    provinceCode: province.code,
    cityCode: city.code,
    districtCode: district.code,
    destinationLabel: [district.name, city.name, province.name].filter(Boolean).join(', '),
  }

  return cachedLocationCodes
}

function buildEstimateKey(items, language, exchangeRate, storePromo) {
  const mode = language === 'en' ? 'intl' : 'id'
  const markup = storePromo?.foreign_display_price_markup_percent ?? exchangeRate?.display_markup_percent ?? 0
  const rate = exchangeRate?.value ?? ''

  return `${mode}:${language}:${rate}:${markup}:${items.map((item) => `${item.product?.slug || item.id}:${item.quantity}`).join('|')}`
}

function formatShippingEstimatePrice(priceMinor, currency, language, exchangeRate, storePromo) {
  const normalizedCurrency = String(currency || 'IDR').toUpperCase()

  if (language === 'en' && normalizedCurrency === 'IDR') {
    return formatIdrMinorForDisplay(priceMinor, language, exchangeRate, storePromo)
  }

  return formatCurrencyAmount(priceMinor, normalizedCurrency, language)
}

function pickCheapestRate(rates = []) {
  return rates.reduce((current, rate) => {
    if (!current) {
      return rate
    }

    return Number(rate.price) < Number(current.price) ? rate : current
  }, null)
}

export async function fetchCartShippingEstimate(items, language = 'id', exchangeRate = null, storePromo = null) {
  if (!Array.isArray(items) || items.length === 0) {
    return null
  }

  const estimateKey = buildEstimateKey(items, language, exchangeRate, storePromo)

  if (estimateKey === cachedEstimateKey && cachedEstimateResult) {
    return cachedEstimateResult
  }

  try {
    const useInternationalEstimate = language === 'en'
    let payload
    let fallbackDestinationLabel

    if (useInternationalEstimate) {
      payload = buildInternationalEstimatePayload(items)
      fallbackDestinationLabel =
        INTERNATIONAL_ESTIMATE_DESTINATION.destinationLabel[language] ||
        INTERNATIONAL_ESTIMATE_DESTINATION.destinationLabel.en
    } else {
      const locationCodes = await resolveDefaultEstimateLocation()

      if (!locationCodes) {
        return null
      }

      payload = buildDomesticEstimatePayload(items, locationCodes)
      fallbackDestinationLabel = locationCodes.destinationLabel
    }

    const data = await fetchCatalogShippingRates(payload)
    const rates = Array.isArray(data?.rates) ? data.rates : []

    if (rates.length === 0) {
      cachedEstimateKey = estimateKey
      cachedEstimateResult = {
        state: 'empty',
        destinationLabel: data?.destination?.name || fallbackDestinationLabel,
        isInternationalEstimate: useInternationalEstimate,
      }

      return cachedEstimateResult
    }

    const cheapestRate = pickCheapestRate(rates)
    const currency = cheapestRate.currency || 'IDR'
    const priceLabel = formatShippingEstimatePrice(
      cheapestRate.price,
      currency,
      language,
      buildDisplayExchangeRate(exchangeRate, storePromo),
      storePromo,
    )

    cachedEstimateKey = estimateKey
    cachedEstimateResult = {
      state: 'ready',
      destinationLabel: data?.destination?.name || fallbackDestinationLabel,
      priceLabel,
      currency,
      priceMinor: cheapestRate.price,
      courierName: cheapestRate.courier_name || cheapestRate.company || '',
      duration: cheapestRate.duration || '',
      isInternationalEstimate: useInternationalEstimate,
    }

    return cachedEstimateResult
  } catch {
    return null
  }
}
