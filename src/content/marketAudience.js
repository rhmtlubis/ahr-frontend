const fallbackAudiencePathsByLocale = {
  id: [
    {
      id: 'b2c-direct',
      label: 'Beli Langsung / Personal',
      audience: 'b2c',
      journey: 'customer_direct',
    },
    {
      id: 'team-order',
      label: 'Tim / Komunitas',
      audience: 'b2b',
      journey: 'consultative_bulk',
    },
    {
      id: 'school-corporate',
      label: 'Sekolah / Corporate',
      audience: 'b2b',
      journey: 'consultative_bulk',
    },
    {
      id: 'reseller-collab',
      label: 'Reseller / Kolaborasi',
      audience: 'hybrid',
      journey: 'assisted_listing',
    },
  ],
  en: [
    {
      id: 'b2c-direct',
      label: 'Direct Purchase / Personal',
      audience: 'b2c',
      journey: 'customer_direct',
    },
    {
      id: 'team-order',
      label: 'Team / Community',
      audience: 'b2b',
      journey: 'consultative_bulk',
    },
    {
      id: 'school-corporate',
      label: 'School / Corporate',
      audience: 'b2b',
      journey: 'consultative_bulk',
    },
    {
      id: 'reseller-collab',
      label: 'Reseller / Collaboration',
      audience: 'hybrid',
      journey: 'assisted_listing',
    },
  ],
}

export function getFallbackAudiencePaths(locale = 'id') {
  return fallbackAudiencePathsByLocale[locale] || fallbackAudiencePathsByLocale.id
}

export function getAudiencePaths(payloadAudiencePaths = [], locale = 'id') {
  return Array.isArray(payloadAudiencePaths) && payloadAudiencePaths.length > 0
    ? payloadAudiencePaths
    : getFallbackAudiencePaths(locale)
}

export function findAudiencePathById(audiencePaths = [], segmentId = '') {
  return audiencePaths.find((item) => item.id === segmentId) || null
}

export const fallbackAudiencePaths = fallbackAudiencePathsByLocale.id
