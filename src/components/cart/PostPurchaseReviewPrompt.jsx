import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, MessageSquareQuote, Star } from 'lucide-react'
import { fetchOrderReviewContext, submitProductReview } from '../../lib/api'
import { useLanguage } from '../../lib/i18n.jsx'

export default function PostPurchaseReviewPrompt({ orderNumber, paymentAccessToken }) {
  const { language } = useLanguage()
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [items, setItems] = useState([])
  const [eligible, setEligible] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [status, setStatus] = useState('loading')
  const [submitState, setSubmitState] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const isEnglish = language === 'en'

  useEffect(() => {
    let cancelled = false

    if (!orderNumber) {
      setStatus('hidden')
      return undefined
    }

    setStatus('loading')
    setErrorMessage('')

    fetchOrderReviewContext(orderNumber, paymentAccessToken)
      .then((context) => {
        if (cancelled) {
          return
        }

        const reviewableItems = Array.isArray(context.items)
          ? context.items.filter((item) => !item.reviewed)
          : []

        setEligible(Boolean(context.eligible))
        setItems(reviewableItems)
        setSelectedItemId(reviewableItems[0]?.order_item_id ?? null)
        setStatus(!context.eligible || reviewableItems.length === 0 ? 'complete' : 'ready')
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        setStatus('error')
        setErrorMessage(error.message)
      })

    return () => {
      cancelled = true
    }
  }, [orderNumber, paymentAccessToken])

  const selectedItem = useMemo(
    () => items.find((item) => item.order_item_id === selectedItemId) || null,
    [items, selectedItemId],
  )

  if (!orderNumber || status === 'hidden' || status === 'loading') {
    return null
  }

  if (status === 'complete') {
    return (
      <section className="post-purchase-review post-purchase-review--complete" aria-live="polite">
        <CheckCircle2 size={22} aria-hidden="true" />
        <p>
          {eligible
            ? isEnglish
              ? 'Thank you. Your review for this order has been recorded.'
              : 'Terima kasih. Ulasan untuk pesanan ini sudah tercatat.'
            : isEnglish
              ? 'You can share a review after payment is confirmed.'
              : 'Anda bisa memberi ulasan setelah pembayaran dikonfirmasi.'}
        </p>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="post-purchase-review post-purchase-review--error">
        <p>{errorMessage}</p>
      </section>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedReview = review.trim()
    if (!trimmedReview || !selectedItemId) {
      return
    }

    setSubmitState('loading')
    setErrorMessage('')

    try {
      await submitProductReview(orderNumber, {
        orderItemId: selectedItemId,
        rating,
        body: trimmedReview,
        paymentAccessToken,
      })

      const remainingItems = items.filter((item) => item.order_item_id !== selectedItemId)
      setItems(remainingItems)
      setReview('')
      setRating(5)
      setSelectedItemId(remainingItems[0]?.order_item_id ?? null)
      setSubmitState(remainingItems.length > 0 ? 'idle' : 'done')
      setStatus(remainingItems.length > 0 ? 'ready' : 'complete')
    } catch (error) {
      setSubmitState('idle')
      setErrorMessage(error.message)
    }
  }

  return (
    <section className="post-purchase-review" aria-label={isEnglish ? 'Share your review' : 'Bagikan ulasan Anda'}>
      <div className="post-purchase-review-head">
        <MessageSquareQuote size={20} aria-hidden="true" />
        <div>
          <h2>{isEnglish ? 'Share your experience' : 'Bagikan pengalaman Anda'}</h2>
          <p>
            {isEnglish
              ? 'Your review helps other buyers choose with confidence.'
              : 'Ulasan Anda membantu pembeli lain memilih dengan lebih yakin.'}
          </p>
        </div>
      </div>

      <form className="post-purchase-review-form" onSubmit={handleSubmit}>
        {items.length > 1 ? (
          <label className="post-purchase-review-field">
            <span>{isEnglish ? 'Product' : 'Produk'}</span>
            <select value={selectedItemId ?? ''} onChange={(event) => setSelectedItemId(Number(event.target.value))}>
              {items.map((item) => (
                <option key={item.order_item_id} value={item.order_item_id}>
                  {item.product_name} x{item.quantity}
                </option>
              ))}
            </select>
          </label>
        ) : selectedItem ? (
          <p className="post-purchase-review-product">
            {isEnglish ? 'Reviewing' : 'Mengulas'}: <strong>{selectedItem.product_name}</strong>
          </p>
        ) : null}

        <fieldset className="post-purchase-review-rating">
          <legend>{isEnglish ? 'Rating' : 'Penilaian'}</legend>
          <div className="post-purchase-review-stars">
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1
              const active = value <= rating

              return (
                <button
                  key={value}
                  type="button"
                  className={active ? 'active' : ''}
                  aria-label={`${value} ${isEnglish ? 'stars' : 'bintang'}`}
                  onClick={() => setRating(value)}
                >
                  <Star size={22} fill={active ? 'currentColor' : 'none'} />
                </button>
              )
            })}
          </div>
        </fieldset>

        <label className="post-purchase-review-field">
          <span>{isEnglish ? 'Your review' : 'Ulasan Anda'}</span>
          <textarea
            rows={4}
            value={review}
            onChange={(event) => setReview(event.target.value)}
            placeholder={
              isEnglish
                ? 'How was the product quality, sizing, and delivery?'
                : 'Bagaimana kualitas produk, ukuran, dan pengiriman?'
            }
            required
            minLength={10}
          />
        </label>

        {errorMessage ? <p className="cart-status error">{errorMessage}</p> : null}

        <button
          className="cta-button cta-button-dark"
          type="submit"
          disabled={!review.trim() || submitState === 'loading'}
        >
          {submitState === 'loading'
            ? isEnglish
              ? 'Sending...'
              : 'Mengirim...'
            : isEnglish
              ? 'Submit review'
              : 'Kirim ulasan'}
        </button>
      </form>
    </section>
  )
}
