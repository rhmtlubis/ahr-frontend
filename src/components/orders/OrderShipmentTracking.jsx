import { useState } from 'react'
import { Copy, ExternalLink, MapPin, RefreshCw, Truck } from 'lucide-react'
import {
  copyTrackingValue,
  getShipmentActiveStepIndex,
  getShipmentPhaseLabel,
  getShipmentSteps,
  shouldShowShipmentTracking,
} from '../../lib/shipmentTracking'

function formatTrackingDate(isoDate, language) {
  if (!isoDate) {
    return '-'
  }

  return new Date(isoDate).toLocaleString(language === 'en' ? 'en-ID' : 'id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrderShipmentTracking({
  order,
  language,
  compact = false,
  onRefresh,
  isRefreshing = false,
}) {
  const [copyStatus, setCopyStatus] = useState('idle')

  if (!shouldShowShipmentTracking(order)) {
    return null
  }

  const shipment = order.shipment || {
    phase: order.shipment_tracking?.phase,
    biteship_status: order.shipment_tracking?.biteship_status,
    biteship_status_label: order.shipment_tracking?.biteship_status_label,
    waybill_id: order.shipment_tracking?.waybill_id,
    tracking_id: order.shipment_tracking?.tracking_id,
    courier_tracking_url: order.shipment_tracking?.courier_tracking_url,
  }

  const shipping = order.shipping
  const phase = shipment.phase || order.shipment_tracking?.phase || 'awaiting_shipment'
  const phaseLabel = getShipmentPhaseLabel(phase, language)
  const statusHeadline =
    shipment.biteship_status_label && shipment.biteship_status_label !== '-'
      ? shipment.biteship_status_label
      : phaseLabel
  const steps = getShipmentSteps(language)
  const activeStep = getShipmentActiveStepIndex({
    phase,
    biteshipStatus: shipment.biteship_status,
    paidAt: order.paid_at,
    orderStatus: order.status,
  })

  const handleCopyWaybill = async () => {
    const value = shipment.waybill_id || shipment.tracking_id

    if (!value) {
      return
    }

    const copied = await copyTrackingValue(value)
    setCopyStatus(copied ? 'success' : 'error')
    window.setTimeout(() => setCopyStatus('idle'), 2000)
  }

  const awaitingShipment = phase === 'awaiting_shipment'
  const hasTrackingLink = Boolean(shipment.courier_tracking_url)
  const history = shipment.history || []

  return (
    <section className={`customer-order-tracking ${compact ? 'customer-order-tracking-compact' : ''}`}>
      <div className="customer-order-payment-info-head">
        <Truck size={18} />
        <div>
          <strong>{language === 'en' ? 'Shipment tracking' : 'Lacak pengiriman'}</strong>
          <p>
            {language === 'en'
              ? 'Follow your package from payment through delivery.'
              : 'Pantau paket Anda dari pembayaran hingga terkirim.'}
          </p>
        </div>
        {onRefresh ? (
          <button
            type="button"
            className="customer-order-tracking-refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={language === 'en' ? 'Refresh tracking' : 'Muat ulang lacak paket'}
          >
            <RefreshCw size={16} className={isRefreshing ? 'customer-order-tracking-refresh-spin' : ''} />
            <span>{language === 'en' ? 'Refresh' : 'Muat ulang'}</span>
          </button>
        ) : null}
      </div>

      {statusHeadline ? (
        <div className={`customer-order-tracking-phase customer-order-tracking-phase-${phase}`}>
          <strong>{statusHeadline}</strong>
          {phaseLabel && shipment.biteship_status_label && shipment.biteship_status_label !== '-' && phaseLabel !== shipment.biteship_status_label ? (
            <span>{phaseLabel}</span>
          ) : null}
        </div>
      ) : null}

      {!compact ? (
        <ol className="customer-order-tracking-steps" aria-label={language === 'en' ? 'Shipment progress' : 'Progres pengiriman'}>
          {steps.map((step, index) => {
            const state = index < activeStep ? 'done' : index === activeStep ? 'current' : 'upcoming'

            return (
              <li key={step.key} className={`customer-order-tracking-step customer-order-tracking-step-${state}`}>
                <span className="customer-order-tracking-step-marker" aria-hidden="true" />
                <span className="customer-order-tracking-step-label">{step.label}</span>
              </li>
            )
          })}
        </ol>
      ) : null}

      {!compact && order.fulfillment_method === 'delivery' && shipping?.address ? (
        <div className="customer-order-tracking-destination">
          <span className="customer-order-tracking-destination-label">
            {language === 'en' ? 'Destination' : 'Tujuan pengiriman'}
          </span>
          <p>{shipping.address}</p>
        </div>
      ) : null}

      {(shipping?.courier_name || shipping?.service_name) && !compact ? (
        <div className="customer-order-tracking-courier">
          <MapPin size={16} aria-hidden="true" />
          <span>
            {[shipping.courier_name, shipping.service_name].filter(Boolean).join(' · ')}
          </span>
        </div>
      ) : null}

      <div className="customer-order-payment-info-meta customer-order-tracking-meta">
        {shipment.waybill_id ? (
          <span>
            {language === 'en' ? 'Waybill' : 'No. resi'}: <strong>{shipment.waybill_id}</strong>
          </span>
        ) : null}
        {shipment.tracking_id && shipment.tracking_id !== shipment.waybill_id ? (
          <span>
            Tracking ID: <strong>{shipment.tracking_id}</strong>
          </span>
        ) : null}
        {shipment.shipment_created_at ? (
          <span>
            {language === 'en' ? 'Shipped at' : 'Shipment dibuat'}:{' '}
            <strong>{formatTrackingDate(shipment.shipment_created_at, language)}</strong>
          </span>
        ) : null}
      </div>

      <div className="customer-order-tracking-actions">
        {(shipment.waybill_id || shipment.tracking_id) && (
          <button type="button" className="customer-order-tracking-copy" onClick={handleCopyWaybill}>
            <Copy size={16} />
            <span>{language === 'en' ? 'Copy waybill' : 'Salin resi'}</span>
          </button>
        )}
        {hasTrackingLink ? (
          <a
            className="customer-order-tracking-link"
            href={shipment.courier_tracking_url}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={16} />
            <span>{language === 'en' ? 'Track on courier site' : 'Lacak di situs kurir'}</span>
          </a>
        ) : null}
      </div>

      {copyStatus === 'success' ? (
        <p className="customer-order-tracking-copy-status">
          {language === 'en' ? 'Waybill copied.' : 'Nomor resi disalin.'}
        </p>
      ) : null}
      {copyStatus === 'error' ? (
        <p className="customer-order-tracking-copy-status error">
          {language === 'en' ? 'Could not copy automatically.' : 'Gagal menyalin otomatis.'}
        </p>
      ) : null}

      {awaitingShipment ? (
        <p className="customer-order-payment-info-hint">
          {language === 'en'
            ? 'Your order is paid. Shipment will appear here once our team hands it to the courier.'
            : 'Pesanan sudah dibayar. Status pengiriman akan muncul setelah paket diserahkan ke kurir.'}
        </p>
      ) : null}

      {!compact && history.length > 0 ? (
        <ul className="customer-order-payment-info-list customer-order-tracking-history">
          {[...history].reverse().map((entry) => (
            <li key={`${entry.status}-${entry.at}`}>
              <span>{entry.label || entry.status}</span>
              <strong>{formatTrackingDate(entry.at, language)}</strong>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
