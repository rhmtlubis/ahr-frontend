export const fallbackAudiencePaths = [
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
]

export function getAudiencePaths(payloadAudiencePaths = []) {
  return Array.isArray(payloadAudiencePaths) && payloadAudiencePaths.length > 0
    ? payloadAudiencePaths
    : fallbackAudiencePaths
}

export function findAudiencePathById(audiencePaths = [], segmentId = '') {
  return audiencePaths.find((item) => item.id === segmentId) || null
}
