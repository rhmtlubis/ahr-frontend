import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import './App.css'
import SiteFooter from './components/layout/SiteFooter'
import SiteHeader from './components/layout/SiteHeader'
import { fetchCatalogLandingPage } from './lib/api'
import { useCart } from './lib/cart.jsx'
import {
  buildCssWhatsAppUrl,
  getCssContactProfile,
  getCssFooterMessage,
} from './lib/cssStoreConfig'
import { useLanguage } from './lib/i18n.jsx'
import { getLandingChromeContent } from './lib/landingContent'
import { getRetailHeaderActions, isCssStore } from './lib/storeConfig'
import useDocumentTitle from './lib/useDocumentTitle'

export default function ReturnPolicyPage() {
  const { language, t } = useLanguage()
  const { itemCount } = useCart()
  const contactProfile = isCssStore() ? getCssContactProfile(language) : null
  const [pageContent, setPageContent] = useState(() =>
    getLandingChromeContent({}, { hashPrefix: '/', locale: language }),
  )

  useDocumentTitle(
    language === 'en' ? 'Return & Exchange Policy' : 'Kebijakan Pengembalian & Penukaran',
    language === 'en'
      ? 'Return and exchange policy for CS Studio online store. Learn about our return conditions, timeframe, and process.'
      : 'Kebijakan pengembalian dan penukaran produk CS Studio. Pelajari syarat, batas waktu, dan proses klaim.',
    {
      canonicalPath: '/kebijakan-pengembalian',
      image: '/css-brand-logo.gif',
      locale: language,
      type: 'website',
    },
  )

  useEffect(() => {
    fetchCatalogLandingPage(language)
      .then((payload) => {
        if (payload?.data) {
          setPageContent(getLandingChromeContent(payload.data, { hashPrefix: '/', locale: language }))
        }
      })
      .catch(() => {
        setPageContent(getLandingChromeContent({}, { hashPrefix: '/', locale: language }))
      })
  }, [language])

  const whatsappNumber = contactProfile?.whatsapp_number || '6289653616294'
  const whatsappUrl = buildCssWhatsAppUrl('Halo CS Studio, saya ingin mengajukan klaim pengembalian/penukaran produk.')

  return (
    <div className="app-shell css-store-shell">
      <SiteHeader
        brandHref="/"
        navGroups={pageContent.navGroups}
        ticker={pageContent.ticker}
        utilityLinks={pageContent.utilityLinks}
        utilityMessage={pageContent.utilityMessage}
        cartItemCount={itemCount}
        {...getRetailHeaderActions()}
      />

      <main className="cart-page terms-page">
        <section className="content-block section-plain cart-hero">
          <div className="all-products-breadcrumb">
            <Link to="/">
              <ArrowLeft size={16} />
              <span>{language === 'en' ? 'Back to home' : 'Kembali ke beranda'}</span>
            </Link>
          </div>
          <div className="section-heading heading-inline cart-heading">
            <div>
              <span>{language === 'en' ? 'Policy' : 'Kebijakan'}</span>
              <h1>{language === 'en' ? 'Return & Exchange Policy' : 'Kebijakan Pengembalian & Penukaran'}</h1>
            </div>
            <p>{language === 'en' ? 'Effective July 2026' : 'Berlaku sejak Juli 2026'}</p>
          </div>
        </section>

        <section className="content-block section-soft">
          <article className="terms-document">
            <p className="terms-document-intro">
              {language === 'en'
                ? 'CS Studio accepts product returns and exchanges under the following conditions. Please read this policy carefully before submitting a claim.'
                : 'CS Studio menerima pengembalian dan penukaran produk dengan ketentuan berikut. Harap baca kebijakan ini dengan seksama sebelum mengajukan klaim.'}
            </p>

            <section className="terms-document-section">
              <h2>{language === 'en' ? '1. Claim Timeframe' : '1. Batas Waktu Klaim'}</h2>
              <p>
                {language === 'en'
                  ? 'Return or exchange claims must be submitted within 24 hours after the package is received. Claims submitted after this period will not be processed.'
                  : 'Klaim pengembalian atau penukaran harus diajukan dalam waktu 24 jam setelah paket diterima. Klaim yang diajukan setelah batas waktu ini tidak akan diproses.'}
              </p>
            </section>

            <section className="terms-document-section">
              <h2>{language === 'en' ? '2. Eligible Conditions for Return' : '2. Kondisi yang Dapat Dikembalikan'}</h2>
              <p>
                {language === 'en'
                  ? 'We accept returns for items that meet the following criteria:'
                  : 'Kami menerima pengembalian untuk produk yang memenuhi kriteria berikut:'}
              </p>
              <ul>
                <li>
                  {language === 'en'
                    ? 'Product is defective or damaged upon arrival (production defect, printing error, wrong size sent)'
                    : 'Produk cacat atau rusak saat diterima (cacat produksi, kesalahan sablon/print, ukuran yang dikirim salah)'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Product received does not match the order (wrong item, wrong color)'
                    : 'Produk yang diterima tidak sesuai pesanan (item salah, warna berbeda)'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Product has not been washed, worn, or altered in any way'
                    : 'Produk belum dicuci, dipakai, atau diubah dalam bentuk apapun'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Product still has original tags and packaging intact'
                    : 'Produk masih memiliki tag dan kemasan asli yang utuh'}
                </li>
              </ul>
            </section>

            <section className="terms-document-section">
              <h2>{language === 'en' ? '3. Non-Returnable Conditions' : '3. Kondisi yang Tidak Dapat Dikembalikan'}</h2>
              <p>
                {language === 'en'
                  ? 'Returns will NOT be accepted if:'
                  : 'Pengembalian TIDAK diterima jika:'}
              </p>
              <ul>
                <li>
                  {language === 'en'
                    ? 'Product has been washed or laundered'
                    : 'Produk sudah dicuci'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Product has been worn or used'
                    : 'Produk sudah dipakai'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Product has been altered, modified, or damaged by the buyer'
                    : 'Produk sudah diubah, dimodifikasi, atau dirusak oleh pembeli'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Claim is submitted after the 24-hour window'
                    : 'Klaim diajukan setelah melewati batas waktu 24 jam'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Size difference due to buyer\'s measurement error (please refer to our size chart)'
                    : 'Perbedaan ukuran karena kesalahan pengukuran pembeli (silakan cek size chart kami)'}
                </li>
              </ul>
            </section>

            <section className="terms-document-section">
              <h2>{language === 'en' ? '4. Exchange Policy' : '4. Kebijakan Penukaran'}</h2>
              <p>
                {language === 'en'
                  ? 'We accept product exchanges under the same conditions as returns. Exchanges are subject to stock availability. If the requested size/item is not available, we will offer a refund or alternative product.'
                  : 'Kami menerima penukaran produk dengan ketentuan yang sama seperti pengembalian. Penukaran bergantung pada ketersediaan stok. Jika ukuran/item yang diminta tidak tersedia, kami akan menawarkan refund atau produk alternatif.'}
              </p>
            </section>

            <section className="terms-document-section">
              <h2>{language === 'en' ? '5. Return Shipping Cost' : '5. Ongkos Kirim Pengembalian'}</h2>
              <p>
                {language === 'en'
                  ? 'Return shipping costs are borne by the buyer. Please use a tracked shipping service when sending items back to us to ensure safe delivery.'
                  : 'Ongkos kirim pengembalian ditanggung oleh pembeli. Harap gunakan jasa pengiriman yang memiliki tracking (resi) saat mengirim barang kembali kepada kami untuk memastikan keamanan pengiriman.'}
              </p>
            </section>

            <section className="terms-document-section">
              <h2>{language === 'en' ? '6. How to Submit a Claim' : '6. Cara Mengajukan Klaim'}</h2>
              <p>
                {language === 'en'
                  ? 'To submit a return or exchange claim, follow these steps:'
                  : 'Untuk mengajukan klaim pengembalian atau penukaran, ikuti langkah berikut:'}
              </p>
              <ol>
                <li>
                  {language === 'en'
                    ? 'Contact us via WhatsApp within 24 hours of receiving the package'
                    : 'Hubungi kami via WhatsApp dalam 24 jam setelah paket diterima'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Provide your order number and a clear photo/video of the issue'
                    : 'Sertakan nomor pesanan dan foto/video jelas yang menunjukkan masalah'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Wait for our team to review and confirm your claim (max 1x24 hours)'
                    : 'Tunggu tim kami meninjau dan mengonfirmasi klaim Anda (maksimal 1x24 jam)'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Once approved, ship the item back to the address we provide'
                    : 'Setelah disetujui, kirim barang kembali ke alamat yang kami berikan'}
                </li>
                <li>
                  {language === 'en'
                    ? 'Replacement will be sent or refund processed after we receive and verify the returned item'
                    : 'Penggantian akan dikirim atau refund diproses setelah kami menerima dan memverifikasi barang yang dikembalikan'}
                </li>
              </ol>
            </section>

            <section className="terms-document-section">
              <h2>{language === 'en' ? '7. Refund Method' : '7. Metode Refund'}</h2>
              <p>
                {language === 'en'
                  ? 'Refunds will be processed via bank transfer to the buyer\'s account within 3-5 business days after the returned item is received and verified.'
                  : 'Refund akan diproses melalui transfer bank ke rekening pembeli dalam 3-5 hari kerja setelah barang yang dikembalikan diterima dan diverifikasi.'}
              </p>
            </section>

            <section className="terms-document-section">
              <h2>{language === 'en' ? '8. Contact Us' : '8. Hubungi Kami'}</h2>
              <p>
                {language === 'en'
                  ? 'For return and exchange claims, please contact our team:'
                  : 'Untuk klaim pengembalian dan penukaran, silakan hubungi tim kami:'}
              </p>
              <p>
                <strong>WhatsApp:</strong>{' '}
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  {`0${whatsappNumber.slice(2)}`}
                </a>
              </p>
              <p>
                <strong>Instagram:</strong>{' '}
                <a href="https://www.instagram.com/customsupplystudio/" target="_blank" rel="noreferrer">
                  @customsupplystudio
                </a>
              </p>
            </section>
          </article>
        </section>
      </main>

      <SiteFooter
        footerGroups={pageContent.footerGroups}
        companyProfile={pageContent.companyProfile}
        contactProfile={contactProfile}
        defaultMapLabel={t('common.mapLabel')}
        footerMessage={getCssFooterMessage(language)}
        bottomText={pageContent.footerBottomText}
        onWhatsAppClick={(message) => {
          window.open(buildCssWhatsAppUrl(message), '_blank', 'noopener,noreferrer')
        }}
      />
    </div>
  )
}
