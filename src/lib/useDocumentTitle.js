import { useEffect } from 'react'

const DEFAULT_TITLE = 'AHR'
const DEFAULT_DESCRIPTION =
  'AHR melayani jersey custom sublimasi, seragam printing, apparel olahraga, dan kebutuhan konveksi custom untuk tim, komunitas, sekolah, dan perusahaan.'

export function buildPageTitle(pageTitle) {
  const trimmedTitle = String(pageTitle || '').trim()

  return trimmedTitle ? `${trimmedTitle} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
}

function ensureMetaDescriptionTag() {
  let metaTag = document.querySelector('meta[name="description"]')

  if (!metaTag) {
    metaTag = document.createElement('meta')
    metaTag.setAttribute('name', 'description')
    document.head.appendChild(metaTag)
  }

  return metaTag
}

export default function useDocumentTitle(pageTitle, pageDescription = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    document.title = buildPageTitle(pageTitle)

    const metaTag = ensureMetaDescriptionTag()
    metaTag.setAttribute('content', String(pageDescription || DEFAULT_DESCRIPTION).trim())
  }, [pageDescription, pageTitle])
}
