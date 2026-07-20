import { useCallback, useEffect, useState } from 'react';
import { api, type ApiError } from '../api/client';
import { config } from '../config';

// INTEGRATION NOTE: this page uses a token header for standalone use. When
// merging into the portal, wrap it in the portal's existing admin layout/auth
// and remove the token prompt (the backend guard should also be swapped —
// see backend app/routers/admin.py).

interface Lead {
  id: number;
  reference_number: string;
  owner_name: string;
  business_name: string;
  mobile_number: string;
  whatsapp_number: string;
  email: string;
  business_category: string;
  city: string;
  state: string;
  business_description: string;
  services_offered: string;
  existing_website_url: string;
  social_media_links: string;
  required_pages: string;
  website_objective: string;
  preferred_contact_method: string;
  preferred_contact_time: string;
  expected_launch_timeline: string;
  budget_range: string;
  has_domain: boolean;
  has_hosting: boolean;
  has_logo: boolean;
  content_ready: boolean;
  images_ready: boolean;
  additional_requirements: string;
  portfolio_permission: boolean;
  status: string;
  priority: string;
  admin_notes: string;
  assigned_to: string;
  created_at: string;
}

interface LeadList {
  items: Lead[];
  total: number;
  page: number;
  page_size: number;
  stats: Record<string, number>;
}

const STATUSES = [
  'new', 'under_review', 'contacted', 'qualified', 'consultation_scheduled',
  'selected', 'proposal_sent', 'development_started', 'awaiting_content',
  'awaiting_feedback', 'completed', 'on_hold', 'rejected', 'duplicate', 'spam',
];

const STAT_CARDS: Array<[string, string]> = [
  ['total', 'Total'], ['new', 'New'], ['under_review', 'Under Review'],
  ['qualified', 'Qualified'], ['selected', 'Selected'],
  ['development_started', 'In Development'], ['completed', 'Completed'],
  ['rejected', 'Rejected'], ['spam', 'Spam'],
];

export default function AdminLeadsPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('promo_admin_token') || '');
  const [tokenInput, setTokenInput] = useState('');
  const [data, setData] = useState<LeadList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState({ q: '', status: '', category: '', city: '', date_from: '', date_to: '', sort: 'newest' });
  const [page, setPage] = useState(1);

  const headers = { 'X-Admin-Token': token };

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    params.set('page', String(page));
    params.set('page_size', '20');
    return params.toString();
  }, [filters, page]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.get<LeadList>(`/api/admin/website-promotion/applications?${buildQuery()}`, headers);
      setData(result);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401) {
        sessionStorage.removeItem('promo_admin_token');
        setToken('');
      }
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [token, buildQuery]);

  useEffect(() => { load(); }, [load]);

  const updateLead = async (id: number, changes: Partial<Lead>) => {
    setSaving(true);
    try {
      const updated = await api.patch<Lead>(`/api/admin/website-promotion/applications/${id}`, changes, headers);
      setSelected(updated);
      setData((d) => d ? { ...d, items: d.items.map((it) => (it.id === id ? updated : it)) } : d);
    } catch (err) {
      alert((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    const response = await fetch(
      `${config.apiBaseUrl}/api/admin/website-promotion/applications/export?${buildQuery()}`,
      { headers },
    );
    if (!response.ok) { alert('Export failed.'); return; }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'website-leads.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!token) {
    return (
      <div className="admin-page admin-login">
        <form
          className="status-card"
          onSubmit={(e) => {
            e.preventDefault();
            sessionStorage.setItem('promo_admin_token', tokenInput.trim());
            setToken(tokenInput.trim());
          }}
        >
          <h2>Website Leads — Admin Access</h2>
          <p>Enter the admin API token to continue.</p>
          <div className="form-field">
            <label htmlFor="admin-token">Admin token</label>
            <input
              id="admin-token"
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit">Sign In</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Website Leads</h1>
        <div className="admin-header-actions">
          <button className="btn btn-outline btn-sm" onClick={exportCsv}>Export CSV</button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { sessionStorage.removeItem('promo_admin_token'); setToken(''); }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {data && (
        <div className="stat-grid">
          {STAT_CARDS.map(([key, label]) => (
            <div className="stat-card" key={key}>
              <span className="stat-value">{data.stats[key] ?? 0}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="admin-filters">
        <input
          placeholder="Search name, business, email, phone, reference…"
          value={filters.q}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, q: e.target.value })); }}
        />
        <select value={filters.status} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })); }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <input placeholder="Category" value={filters.category}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, category: e.target.value })); }} />
        <input placeholder="City" value={filters.city}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, city: e.target.value })); }} />
        <input type="date" aria-label="From date" value={filters.date_from}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, date_from: e.target.value })); }} />
        <input type="date" aria-label="To date" value={filters.date_to}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, date_to: e.target.value })); }} />
        <select value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {error && <div className="form-server-error" role="alert">{error}</div>}
      {loading && <p className="empty-state">Loading applications…</p>}
      {!loading && data && data.items.length === 0 && (
        <p className="empty-state">No applications match the current filters.</p>
      )}

      {!loading && data && data.items.length > 0 && (
        <div className="table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Reference</th><th>Owner</th><th>Business</th><th>Category</th>
                <th>City</th><th>Status</th><th>Priority</th><th>Submitted</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.reference_number}</td>
                  <td>{lead.owner_name}</td>
                  <td>{lead.business_name}</td>
                  <td>{lead.business_category}</td>
                  <td>{lead.city}</td>
                  <td><span className={`lead-status s-${lead.status}`}>{lead.status.replace(/_/g, ' ')}</span></td>
                  <td>{lead.priority}</td>
                  <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelected(lead)}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > data.page_size && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>Page {page} of {Math.ceil(data.total / data.page_size)}</span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= Math.ceil(data.total / data.page_size)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" role="presentation" onClick={() => setSelected(null)}>
          <div
            className="modal admin-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Application ${selected.reference_number}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-head">
              <h2>{selected.business_name}</h2>
              <button className="menu-toggle" aria-label="Close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <p className="drawer-ref">{selected.reference_number} · {new Date(selected.created_at).toLocaleString()}</p>

            <div className="drawer-actions">
              <a className="btn btn-outline btn-sm" href={`tel:+91${selected.mobile_number}`}>Call</a>
              <a className="btn btn-whatsapp btn-sm" href={`https://wa.me/91${selected.whatsapp_number}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a className="btn btn-outline btn-sm" href={`mailto:${selected.email}`}>Email</a>
            </div>

            <dl className="drawer-details">
              <dt>Owner</dt><dd>{selected.owner_name}</dd>
              <dt>Contact</dt><dd>{selected.mobile_number} · {selected.email}</dd>
              <dt>Location</dt><dd>{selected.city}, {selected.state}</dd>
              <dt>Category</dt><dd>{selected.business_category}</dd>
              <dt>Description</dt><dd>{selected.business_description}</dd>
              <dt>Services</dt><dd>{selected.services_offered}</dd>
              {selected.existing_website_url && (<><dt>Existing site</dt><dd>{selected.existing_website_url}</dd></>)}
              {selected.required_pages && (<><dt>Pages</dt><dd>{selected.required_pages}</dd></>)}
              {selected.website_objective && (<><dt>Objective</dt><dd>{selected.website_objective}</dd></>)}
              <dt>Budget</dt><dd>{selected.budget_range || '—'}</dd>
              <dt>Timeline</dt><dd>{selected.expected_launch_timeline || '—'}</dd>
              <dt>Contact pref.</dt><dd>{selected.preferred_contact_method} {selected.preferred_contact_time && `· ${selected.preferred_contact_time}`}</dd>
              <dt>Readiness</dt>
              <dd>
                Domain: {selected.has_domain ? 'Yes' : 'No'} · Hosting: {selected.has_hosting ? 'Yes' : 'No'} ·
                Logo: {selected.has_logo ? 'Yes' : 'No'} · Content: {selected.content_ready ? 'Yes' : 'No'} ·
                Images: {selected.images_ready ? 'Yes' : 'No'}
              </dd>
              <dt>Portfolio OK</dt><dd>{selected.portfolio_permission ? 'Willing to discuss' : 'Not indicated'}</dd>
              {selected.additional_requirements && (<><dt>Notes from client</dt><dd>{selected.additional_requirements}</dd></>)}
            </dl>

            <div className="drawer-edit">
              <div className="form-field">
                <label htmlFor="lead-status">Status</label>
                <select
                  id="lead-status"
                  value={selected.status}
                  disabled={saving}
                  onChange={(e) => updateLead(selected.id, { status: e.target.value })}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="lead-priority">Priority</label>
                <select
                  id="lead-priority"
                  value={selected.priority}
                  disabled={saving}
                  onChange={(e) => updateLead(selected.id, { priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="lead-assigned">Assigned to</label>
                <input
                  id="lead-assigned"
                  defaultValue={selected.assigned_to}
                  disabled={saving}
                  onBlur={(e) => e.target.value !== selected.assigned_to && updateLead(selected.id, { assigned_to: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="lead-notes">Admin notes</label>
                <textarea
                  id="lead-notes"
                  rows={4}
                  defaultValue={selected.admin_notes}
                  disabled={saving}
                  onBlur={(e) => e.target.value !== selected.admin_notes && updateLead(selected.id, { admin_notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
