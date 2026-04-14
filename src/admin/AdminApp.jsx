import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  CalendarClock,
  CircleCheckBig,
  Download,
  Filter,
  ListChecks,
  LoaderCircle,
  LogOut,
  Phone,
  RefreshCw,
  Search,
  ShieldUser,
} from 'lucide-react'
import './admin.css'
import { apiClient, ensureCsrfCookie, getApiUrl } from '../lib/api'

const emptyFilters = {
  search: '',
  status: '',
  segment: '',
  utm_source: '',
  created_from: '',
  created_until: '',
  follow_up_state: '',
}

const emptyLeadForm = {
  status: '',
  last_contact_at: '',
  next_follow_up_at: '',
  follow_up_notes: '',
}

const defaultMeta = { current_page: 1, last_page: 1, per_page: 15, total: 0 }

function toDatetimeLocal(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (number) => String(number).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function pickErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    Object.values(error?.response?.data?.errors || {}).flat()[0] ||
    fallback
  )
}

function buildQuery(filters, extra = {}) {
  const params = new URLSearchParams()

  Object.entries({ ...filters, ...extra }).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const query = params.toString()

  return query ? `?${query}` : ''
}

function SummaryCard({ title, value, accent = 'gold' }) {
  return (
    <article className={`admin-summary-card accent-${accent}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  )
}

function AdminLogin({ onLogin, loading, errorMessage }) {
  const [form, setForm] = useState({ username: 'admin', password: 'password' })

  const submit = async (event) => {
    event.preventDefault()
    await onLogin(form)
  }

  return (
    <div className="admin-shell admin-auth-shell">
      <section className="admin-auth-card">
        <div className="admin-auth-copy">
          <span className="admin-kicker">AHR Admin CRM</span>
          <h1>Masuk ke dashboard lead yang sudah terhubung ke backend JSON.</h1>
          <p>
            Panel ini dipakai untuk lihat pipeline, buka detail lead, atur follow-up, dan
            menindaklanjuti inquiry yang masuk dari landing page.
          </p>
        </div>

        <form className="admin-auth-form" onSubmit={submit}>
          <label>
            Username
            <input
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="admin"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="password"
            />
          </label>
          <button className="admin-primary-button" type="submit" disabled={loading}>
            {loading ? 'Masuk...' : 'Masuk Dashboard'}
          </button>
          {errorMessage ? <p className="admin-form-error">{errorMessage}</p> : null}
        </form>
      </section>
    </div>
  )
}

function LeadDetailPanel({
  lead,
  form,
  onChange,
  onSave,
  saving,
  saveMessage,
  errorMessage,
}) {
  if (!lead) {
    return (
      <aside className="admin-panel admin-detail-empty">
        <ShieldUser size={22} />
        <h2>Pilih lead untuk lihat detail</h2>
        <p>Detail lengkap, histori aktivitas, dan form update follow-up akan muncul di area ini.</p>
      </aside>
    )
  }

  return (
    <aside className="admin-detail-stack">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Detail Lead</span>
            <h2>{lead.name}</h2>
          </div>
          <span className="admin-status-pill">{lead.status_label}</span>
        </div>

        <div className="admin-meta-grid">
          <div>
            <span>Phone</span>
            <strong>{lead.phone}</strong>
          </div>
          <div>
            <span>Organisasi</span>
            <strong>{lead.organization || '-'}</strong>
          </div>
          <div>
            <span>Segmen</span>
            <strong>{lead.segment || '-'}</strong>
          </div>
          <div>
            <span>Qty</span>
            <strong>{lead.quantity_estimate || '-'}</strong>
          </div>
          <div>
            <span>UTM Source</span>
            <strong>{lead.utm_source || 'direct'}</strong>
          </div>
          <div>
            <span>Campaign</span>
            <strong>{lead.utm_campaign || '-'}</strong>
          </div>
          <div>
            <span>Masuk</span>
            <strong>{formatDateTime(lead.created_at)}</strong>
          </div>
          <div>
            <span>Next Follow-up</span>
            <strong>{formatDateTime(lead.next_follow_up_at)}</strong>
          </div>
        </div>

        <div className="admin-note-card">
          <span>Catatan Follow-up</span>
          <p>{lead.follow_up_notes || 'Belum ada catatan follow-up.'}</p>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Update CRM</span>
            <h2>Sinkronkan status dan follow-up</h2>
          </div>
        </div>

        <form className="admin-update-form" onSubmit={onSave}>
          <label>
            Status
            <select name="status" value={form.status} onChange={onChange}>
              <option value="">Pilih status</option>
              <option value="prospect">Prospect</option>
              <option value="follow_up">Follow Up</option>
              <option value="negosiasi">Negosiasi</option>
              <option value="closing">Closing</option>
              <option value="repeat">Repeat</option>
            </select>
          </label>
          <label>
            Kontak terakhir
            <input
              type="datetime-local"
              name="last_contact_at"
              value={form.last_contact_at}
              onChange={onChange}
            />
          </label>
          <label>
            Follow-up berikutnya
            <input
              type="datetime-local"
              name="next_follow_up_at"
              value={form.next_follow_up_at}
              onChange={onChange}
            />
          </label>
          <label>
            Catatan follow-up
            <textarea
              name="follow_up_notes"
              value={form.follow_up_notes}
              onChange={onChange}
              placeholder="Tulis update negosiasi, kebutuhan revisi, atau hasil follow-up terakhir"
            />
          </label>
          <button className="admin-primary-button" type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Update'}
          </button>
          {saveMessage ? <p className="admin-form-success">{saveMessage}</p> : null}
          {errorMessage ? <p className="admin-form-error">{errorMessage}</p> : null}
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <span className="admin-kicker">Histori Aktivitas</span>
            <h2>Jejak perubahan lead</h2>
          </div>
        </div>

        <div className="admin-activity-list">
          {(lead.activities || []).length > 0 ? (
            lead.activities.map((activity) => (
              <article className="admin-activity-item" key={activity.id}>
                <strong>{activity.title}</strong>
                <p>{activity.description || 'Tidak ada deskripsi tambahan.'}</p>
                <small>{formatDateTime(activity.created_at)}</small>
              </article>
            ))
          ) : (
            <div className="admin-empty-state small">
              <p>Belum ada aktivitas untuk lead ini.</p>
            </div>
          )}
        </div>
      </section>
    </aside>
  )
}

export default function AdminApp() {
  const navigate = useNavigate()
  const { leadId: routeLeadId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sessionChecked, setSessionChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [filters, setFilters] = useState(() => ({
    ...emptyFilters,
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    segment: searchParams.get('segment') || '',
    utm_source: searchParams.get('utm_source') || '',
    created_from: searchParams.get('created_from') || '',
    created_until: searchParams.get('created_until') || '',
    follow_up_state: searchParams.get('follow_up_state') || '',
  }))
  const [leads, setLeads] = useState([])
  const [meta, setMeta] = useState({
    ...defaultMeta,
    current_page: Number(searchParams.get('page') || 1),
  })
  const [listLoading, setListLoading] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState(routeLeadId ? Number(routeLeadId) : null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [leadForm, setLeadForm] = useState(emptyLeadForm)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [detailError, setDetailError] = useState('')

  const syncLeadForm = (lead) => {
    setLeadForm({
      status: lead?.status || '',
      last_contact_at: toDatetimeLocal(lead?.last_contact_at),
      next_follow_up_at: toDatetimeLocal(lead?.next_follow_up_at),
      follow_up_notes: lead?.follow_up_notes || '',
    })
  }

  const syncUrlState = useCallback((nextFilters, nextLeadId, nextPage) => {
    const params = new URLSearchParams()

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    if (nextPage && nextPage > 1) {
      params.set('page', String(nextPage))
    }

    const queryString = params.toString()
    const targetPath = nextLeadId ? `/admin/leads/${nextLeadId}` : '/admin'

    navigate(`${targetPath}${queryString ? `?${queryString}` : ''}`, { replace: true })
  }, [navigate])

  const loadSession = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/admin/session')
      setAuthenticated(response.data?.data?.authenticated === true)
    } catch {
      setAuthenticated(false)
    } finally {
      setSessionChecked(true)
    }
  }, [])

  const loadDashboard = useCallback(async (
    nextFilters = filters,
    nextPerPage = meta.per_page || 15,
    nextPage = meta.current_page || 1,
  ) => {
    const query = buildQuery(nextFilters, { page: nextPage })
    const [dashboardResponse, leadsResponse] = await Promise.all([
      apiClient.get(`/api/admin/dashboard${query}`),
      apiClient.get(`/api/admin/leads${buildQuery(nextFilters, { per_page: nextPerPage, page: nextPage })}`),
    ])

    setDashboard(dashboardResponse.data.data)
    setLeads(leadsResponse.data.data)
    setMeta(leadsResponse.data.meta)

    if (routeLeadId) {
      return
    }

    if (!selectedLeadId && leadsResponse.data.data.length > 0) {
      setSelectedLeadId(leadsResponse.data.data[0].id)
    }
  }, [filters, meta.current_page, meta.per_page, routeLeadId, selectedLeadId])

  const loadLead = useCallback(async (leadId) => {
    if (!leadId) {
      return
    }

    setDetailLoading(true)
    setDetailError('')

    try {
      const response = await apiClient.get(`/api/admin/leads/${leadId}`)
      setSelectedLead(response.data.data)
      syncLeadForm(response.data.data)
    } catch (error) {
      setDetailError(pickErrorMessage(error, 'Detail lead gagal dimuat.'))
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!routeLeadId) {
      return
    }

    setSelectedLeadId(Number(routeLeadId))
  }, [routeLeadId])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  useEffect(() => {
    if (!authenticated) {
      return
    }

    setListLoading(true)
    loadDashboard()
      .catch(() => {
        setDashboard(null)
        setLeads([])
      })
      .finally(() => {
        setListLoading(false)
      })
  }, [authenticated, loadDashboard])

  useEffect(() => {
    if (!authenticated || !selectedLeadId) {
      return
    }

    loadLead(selectedLeadId)
  }, [authenticated, loadLead, selectedLeadId])

  const handleLogin = async (credentials) => {
    setAuthLoading(true)
    setAuthError('')

    try {
      await ensureCsrfCookie()
      await apiClient.post('/api/admin/login', credentials)
      setAuthenticated(true)
      syncUrlState(filters, routeLeadId ? Number(routeLeadId) : null, meta.current_page)
    } catch (error) {
      setAuthError(pickErrorMessage(error, 'Login admin gagal.'))
    } finally {
      setAuthLoading(false)
      setSessionChecked(true)
    }
  }

  const handleLogout = async () => {
    await apiClient.post('/api/admin/logout')
    setAuthenticated(false)
    setDashboard(null)
    setLeads([])
    setSelectedLead(null)
    setSelectedLeadId(null)
    setSearchParams({})
  }

  const submitFilters = async (event) => {
    event.preventDefault()
    setListLoading(true)

    try {
      const nextPage = 1
      setMeta((current) => ({ ...current, current_page: nextPage }))
      syncUrlState(filters, selectedLeadId, nextPage)
      await loadDashboard(filters, meta.per_page, nextPage)
    } finally {
      setListLoading(false)
    }
  }

  const refreshData = async () => {
    setListLoading(true)

    try {
      await loadDashboard(filters, meta.per_page, meta.current_page)

      if (selectedLeadId) {
        await loadLead(selectedLeadId)
      }
    } finally {
      setListLoading(false)
    }
  }

  const handleSaveLead = async (event) => {
    event.preventDefault()

    if (!selectedLeadId) {
      return
    }

    setSaveLoading(true)
    setSaveMessage('')
    setDetailError('')

    try {
      const response = await apiClient.patch(`/api/admin/leads/${selectedLeadId}`, leadForm)
      setSelectedLead(response.data.data)
      syncLeadForm(response.data.data)
      setSaveMessage('Lead berhasil diperbarui.')
      await loadDashboard(filters, meta.per_page, meta.current_page)
    } catch (error) {
      setDetailError(pickErrorMessage(error, 'Update lead gagal disimpan.'))
    } finally {
      setSaveLoading(false)
    }
  }

  if (!sessionChecked) {
    return (
      <div className="admin-shell admin-loading-shell">
        <LoaderCircle className="spin" size={30} />
        <p>Memeriksa session admin...</p>
      </div>
    )
  }

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} loading={authLoading} errorMessage={authError} />
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <span className="admin-kicker">AHR Modern CRM</span>
          <h1>Dashboard admin React yang langsung consume backend JSON.</h1>
          <p>Pantau lead, buka detail inquiry, dan kelola follow-up dari satu workspace.</p>
        </div>

        <div className="admin-topbar-actions">
          <button className="admin-secondary-button" type="button" onClick={refreshData}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <a className="admin-secondary-button" href={getApiUrl(`/api/admin/leads-export${buildQuery(filters)}`)}>
            <Download size={16} />
            Export CSV
          </a>
          <button className="admin-primary-button subtle" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main-grid">
        <section className="admin-content-stack">
          <div className="admin-summary-grid">
            <SummaryCard title="Total Lead" value={dashboard?.summary?.total_leads ?? 0} accent="gold" />
            <SummaryCard title="Lead Hari Ini" value={dashboard?.summary?.today_leads ?? 0} accent="navy" />
            <SummaryCard title="Closing" value={dashboard?.summary?.closing_leads ?? 0} accent="green" />
            <SummaryCard title="Due Follow-up" value={dashboard?.summary?.due_follow_ups ?? 0} accent="orange" />
          </div>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span className="admin-kicker">Filter & Pipeline</span>
                <h2>Lead list yang siap dipakai tim follow-up</h2>
              </div>
            </div>

            <form className="admin-filter-grid" onSubmit={submitFilters}>
              <label className="admin-search-field">
                <Search size={16} />
                <input
                  placeholder="Cari nama, WA, instansi"
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                />
              </label>
              <select
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="">Semua status</option>
                {(dashboard?.filter_options?.statuses || []).map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.segment}
                onChange={(event) => setFilters((current) => ({ ...current, segment: event.target.value }))}
              >
                <option value="">Semua segmen</option>
                {(dashboard?.filter_options?.segments || []).map((segment) => (
                  <option key={segment} value={segment}>
                    {segment}
                  </option>
                ))}
              </select>
              <select
                value={filters.utm_source}
                onChange={(event) => setFilters((current) => ({ ...current, utm_source: event.target.value }))}
              >
                <option value="">Semua source</option>
                {(dashboard?.filter_options?.sources || []).map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={filters.created_from}
                onChange={(event) => setFilters((current) => ({ ...current, created_from: event.target.value }))}
              />
              <input
                type="date"
                value={filters.created_until}
                onChange={(event) => setFilters((current) => ({ ...current, created_until: event.target.value }))}
              />
              <select
                value={filters.follow_up_state}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, follow_up_state: event.target.value }))
                }
              >
                <option value="">Semua follow-up</option>
                {(dashboard?.filter_options?.follow_up_states || []).map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              <button className="admin-primary-button" type="submit">
                <Filter size={16} />
                Terapkan
              </button>
            </form>

            <div className="admin-status-breakdown">
              {(dashboard?.status_breakdown || []).map((status) => (
                <div className="admin-mini-stat" key={status.value}>
                  <span>{status.label}</span>
                  <strong>{status.total}</strong>
                </div>
              ))}
            </div>

            <div className="admin-table-shell">
              {listLoading ? (
                <div className="admin-empty-state">
                  <LoaderCircle className="spin" size={24} />
                  <p>Memuat daftar lead...</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>PIC</th>
                      <th>Status</th>
                      <th>Order</th>
                      <th>Follow-up</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length > 0 ? (
                      leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className={selectedLeadId === lead.id ? 'selected' : ''}
                          onClick={() => {
                            setSelectedLeadId(lead.id)
                            syncUrlState(filters, lead.id, meta.current_page)
                          }}
                        >
                          <td>
                            <strong>{lead.name}</strong>
                            <span>{lead.organization || 'Tanpa instansi'}</span>
                          </td>
                          <td>
                            <span className="admin-status-pill">{lead.status_label}</span>
                          </td>
                          <td>
                            <strong>{lead.segment || '-'}</strong>
                            <span>{lead.quantity_estimate || '-'}</span>
                          </td>
                          <td>
                            <strong>{formatDateTime(lead.next_follow_up_at)}</strong>
                            <span>{lead.follow_up_notes || 'Belum ada catatan'}</span>
                          </td>
                          <td>
                            <strong>{lead.utm_source || 'direct'}</strong>
                            <span>{formatDate(lead.created_at)}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">
                          <div className="admin-empty-state small">
                            <p>Belum ada lead yang cocok dengan filter ini.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="admin-pagination">
              <button
                className="admin-secondary-button"
                type="button"
                disabled={meta.current_page <= 1 || listLoading}
                onClick={async () => {
                  const nextPage = meta.current_page - 1
                  setListLoading(true)
                  setMeta((current) => ({ ...current, current_page: nextPage }))
                  syncUrlState(filters, selectedLeadId, nextPage)
                  try {
                    await loadDashboard(filters, meta.per_page, nextPage)
                  } finally {
                    setListLoading(false)
                  }
                }}
              >
                Prev
              </button>
              <span className="admin-pagination-label">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <button
                className="admin-secondary-button"
                type="button"
                disabled={meta.current_page >= meta.last_page || listLoading}
                onClick={async () => {
                  const nextPage = meta.current_page + 1
                  setListLoading(true)
                  setMeta((current) => ({ ...current, current_page: nextPage }))
                  syncUrlState(filters, selectedLeadId, nextPage)
                  try {
                    await loadDashboard(filters, meta.per_page, nextPage)
                  } finally {
                    setListLoading(false)
                  }
                }}
              >
                Next
              </button>
            </div>
          </section>

          <div className="admin-lower-grid">
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <span className="admin-kicker">Prioritas</span>
                  <h2>Follow-up jatuh tempo</h2>
                </div>
                <CalendarClock size={18} />
              </div>
              <div className="admin-list-stack">
                {(dashboard?.due_follow_ups || []).length > 0 ? (
                  dashboard.due_follow_ups.map((lead) => (
                    <article className="admin-list-item" key={lead.id}>
                      <strong>{lead.name}</strong>
                      <span>{lead.organization || 'Tanpa instansi'}</span>
                      <small>{formatDateTime(lead.next_follow_up_at)}</small>
                    </article>
                  ))
                ) : (
                  <div className="admin-empty-state small">
                    <p>Tidak ada follow-up yang jatuh tempo.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <span className="admin-kicker">Aktivitas</span>
                  <h2>Pergerakan lead terbaru</h2>
                </div>
                <ListChecks size={18} />
              </div>
              <div className="admin-list-stack">
                {(dashboard?.recent_activities || []).length > 0 ? (
                  dashboard.recent_activities.map((activity) => (
                    <article className="admin-list-item" key={activity.id}>
                      <strong>{activity.title}</strong>
                      <span>{activity.lead?.name || 'Lead terhapus'}</span>
                      <small>{formatDateTime(activity.created_at)}</small>
                    </article>
                  ))
                ) : (
                  <div className="admin-empty-state small">
                    <p>Belum ada aktivitas terbaru.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>

        {detailLoading ? (
          <aside className="admin-panel admin-detail-empty">
            <LoaderCircle className="spin" size={24} />
            <p>Memuat detail lead...</p>
          </aside>
        ) : (
          <LeadDetailPanel
            lead={selectedLead}
            form={leadForm}
            onChange={(event) =>
              setLeadForm((current) => ({ ...current, [event.target.name]: event.target.value }))
            }
            onSave={handleSaveLead}
            saving={saveLoading}
            saveMessage={saveMessage}
            errorMessage={detailError}
          />
        )}
      </main>

      <footer className="admin-footer">
        <div>
          <CircleCheckBig size={16} />
          <span>{meta.total} lead tersedia di sistem.</span>
        </div>
        <div>
          <Phone size={16} />
          <span>Halaman {meta.current_page} dari {meta.last_page}</span>
        </div>
        {selectedLeadId ? (
          <Link className="admin-secondary-button" to={`/admin/leads/${selectedLeadId}${buildQuery(filters, meta.current_page > 1 ? { page: meta.current_page } : {})}`}>
            Buka URL Lead
          </Link>
        ) : null}
      </footer>
    </div>
  )
}
