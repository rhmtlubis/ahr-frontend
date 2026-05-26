export function isCatalogListingPath(pathname = '') {
  return pathname === '/all-products' || pathname.startsWith('/kategori/')
}
