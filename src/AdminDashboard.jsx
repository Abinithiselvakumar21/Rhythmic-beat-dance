import { useEffect, useState, useMemo } from 'react';
import './AdminDashboard.css';

const SERVER = 'https://rhythmic-beat-dance.onrender.com';
const API = `${SERVER}/api/events`;
const BOOKINGS_API = `${SERVER}/api/bookings`;
const UPLOAD_API = `${SERVER}/api/upload`;
const STUDIO_PHONE = '919994716471';

const emptyForm = {
  title: '',
  description: '',
  status: 'Upcoming',
  slots: 20,
  prize: '₹1,000',
  date: '',
  time: '',
  image: '',
  song: '',
};

function AdminDashboard() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('workshops'); // 'workshops' | 'bookings' | 'overview' | 'branches'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data State
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [songFile, setSongFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const token = () => sessionStorage.getItem('adminToken');

  function assetUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${SERVER}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  function formatSongName(songPath) {
    if (!songPath || songPath.trim() === '') {
      return 'Special Choreography Track';
    }
    const clean = songPath.split('/').pop().replace(/\.[^/.]+$/, '');
    const formatted = clean.replace(/^\d+[-_]?/, '').replace(/[-_]+/g, ' ').trim();
    return formatted
      ? formatted.replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Special Choreography Track';
  }

  async function readResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
  }

  // 1. Load Events from Backend
  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const response = await fetch(API, { cache: 'no-store' });
      const data = await readResponse(response);
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Load events error:', error);
      showNotice(`Unable to load workshops: ${error.message}`, 'error');
    } finally {
      setLoadingEvents(false);
    }
  }

  // 2. Load Bookings from Backend
  async function loadBookings() {
    setLoadingBookings(true);
    try {
      const response = await fetch(BOOKINGS_API, { cache: 'no-store' });
      const data = await readResponse(response);
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (error) {
      console.error('Load bookings error:', error);
    } finally {
      setLoadingBookings(false);
    }
  }

  useEffect(() => {
    loadEvents();
    loadBookings();
  }, []);

  function showNotice(text, type = 'info') {
    setStatusMessage(text);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage('');
    }, 5000);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // File Upload Helper
  async function uploadFile(file, kind, authToken) {
    const formData = new FormData();
    formData.append('kind', kind);
    formData.append('file', file);

    const response = await fetch(UPLOAD_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await readResponse(response);
    return data.url;
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setSongFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  }

  function openEditModal(event) {
    setEditingId(event._id);
    setForm({
      title: event.title || '',
      description: event.description || '',
      status: event.status || 'Upcoming',
      slots: event.slots ?? 20,
      prize: event.prize || '',
      date: event.date || '',
      time: event.time || '',
      image: event.image || '',
      song: event.song || '',
    });
    setImageFile(null);
    setSongFile(null);
    setImagePreview(event.image ? assetUrl(event.image) : '');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setSongFile(null);
    setImagePreview('');
  }

  // Handle Form Submit (Create or Update)
  async function handleFormSubmit(e) {
    e.preventDefault();
    if (formLoading) return;

    setFormLoading(true);
    const authToken = token();

    if (!authToken) {
      alert('Session expired. Please login again.');
      window.location.href = '/admin';
      return;
    }

    try {
      let image = form.image || '';
      let song = form.song || '';

      if (imageFile) {
        showNotice('Uploading poster image...', 'info');
        image = await uploadFile(imageFile, 'image', authToken);
      }

      if (songFile) {
        showNotice('Uploading audio track...', 'info');
        song = await uploadFile(songFile, 'song', authToken);
      }

      showNotice('Saving workshop to database...', 'info');

      const url = editingId ? `${API}/${editingId}` : API;
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...form,
          image,
          song,
          slots: Number(form.slots) || 0,
        }),
      });

      await readResponse(response);

      showNotice(
        editingId ? 'Workshop updated successfully!' : 'New workshop created successfully!',
        'success'
      );
      closeModal();
      await loadEvents();
    } catch (error) {
      console.error('Submit error:', error);
      showNotice(error.message || 'Failed to save workshop.', 'error');
    } finally {
      setFormLoading(false);
    }
  }

  // Delete Workshop
  async function handleDeleteEvent(id, title) {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    const authToken = token();
    if (!authToken) {
      window.location.href = '/admin';
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      await readResponse(response);
      showNotice('Workshop deleted successfully!', 'success');
      await loadEvents();
    } catch (error) {
      console.error('Delete error:', error);
      showNotice(error.message || 'Delete failed.', 'error');
    }
  }

  // Update Booking Status (e.g. Confirmed / Pending)
  async function handleToggleBookingStatus(booking) {
    const nextStatus = booking.status === 'Confirmed' ? 'Pending' : 'Confirmed';
    try {
      const response = await fetch(`${BOOKINGS_API}/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      await readResponse(response);
      showNotice(`Booking status updated to ${nextStatus}!`, 'success');
      await loadBookings();
    } catch (error) {
      console.error('Update booking error:', error);
      showNotice('Unable to update booking status.', 'error');
    }
  }

  // Delete Booking
  async function handleDeleteBooking(id, dancerName) {
    if (!window.confirm(`Delete booking for dancer "${dancerName}"?`)) {
      return;
    }
    try {
      const response = await fetch(`${BOOKINGS_API}/${id}`, {
        method: 'DELETE',
      });
      await readResponse(response);
      showNotice('Booking deleted successfully!', 'success');
      await loadBookings();
    } catch (error) {
      console.error('Delete booking error:', error);
      showNotice('Unable to delete booking.', 'error');
    }
  }

  // Logout
  function handleLogout() {
    sessionStorage.removeItem('adminToken');
    window.location.href = '/admin';
  }

  // Filtered Workshops
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        ev.title?.toLowerCase().includes(q) ||
        ev.description?.toLowerCase().includes(q) ||
        ev.date?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All' ||
        (ev.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesQuery && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.phone?.toLowerCase().includes(q) ||
        b.ticketId?.toLowerCase().includes(q) ||
        b.eventTitle?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All' ||
        (b.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesQuery && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // Overview Metrics
  const metrics = useMemo(() => {
    const totalWorkshops = events.length;
    const upcomingWorkshops = events.filter(
      (e) => (e.status || '').toLowerCase() === 'upcoming'
    ).length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed').length;
    const totalSlots = events.reduce((sum, e) => sum + (Number(e.slots) || 0), 0);

    return {
      totalWorkshops,
      upcomingWorkshops,
      totalBookings,
      confirmedBookings,
      totalSlots,
    };
  }, [events, bookings]);

  return (
    <div className="saas-admin-wrapper">
      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div
          className="saas-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Matching reference image exactly) */}
      <aside className={`saas-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <span>⚡</span>
          </div>
          <div className="brand-text-box">
            <h2>RHYTHMIC BEAT</h2>
            <p>DANCE COURT ADMIN</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-menu">
          <button
            type="button"
            className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-label">Dashboard</span>
          </button>

          <button
            type="button"
            className={`menu-item ${activeTab === 'workshops' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('workshops');
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">💃</span>
            <span className="menu-label">All Workshops</span>
            {events.length > 0 && (
              <span className="menu-badge">{events.length}</span>
            )}
          </button>

          <button
            type="button"
            className="menu-item action-item"
            onClick={() => {
              openCreateModal();
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">➕</span>
            <span className="menu-label">Add New Workshop</span>
          </button>

          <button
            type="button"
            className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('bookings');
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">🎟️</span>
            <span className="menu-label">Registrations / Bookings</span>
            {bookings.length > 0 && (
              <span className="menu-badge highlight">{bookings.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`menu-item ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('branches');
              setSidebarOpen(false);
            }}
          >
            <span className="menu-icon">🏢</span>
            <span className="menu-label">Branches</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="menu-item link-item"
          >
            <span className="menu-icon">🌐</span>
            <span className="menu-label">View Live Website</span>
            <span className="external-arrow">↗</span>
          </a>
        </nav>

        {/* Bottom Sidebar: Super Admin Card & Logout */}
        <div className="sidebar-footer">
          <div className="admin-profile-pill">
            <div className="avatar-circle">S</div>
            <div className="profile-details">
              <strong>Super Admin</strong>
              <small>superadmin</small>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="saas-main-area">
        {/* TOP ACTION BAR */}
        <header className="saas-top-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              ☰
            </button>

            <div>
              <h1 className="header-title">
                {activeTab === 'workshops' && 'ALL WORKSHOPS & MASTERCLASSES'}
                {activeTab === 'bookings' && 'WORKSHOP REGISTRATIONS & PASSES'}
                {activeTab === 'overview' && 'ACADEMY DASHBOARD OVERVIEW'}
                {activeTab === 'branches' && 'STUDIO BRANCHES & VENUES'}
              </h1>
              <p className="header-subtitle">
                {activeTab === 'workshops' &&
                  'Monitor and manage all studio masterclasses, schedules, and choreographies'}
                {activeTab === 'bookings' &&
                  'Review dancer registrations, instant ticket codes, and WhatsApp passes'}
                {activeTab === 'overview' &&
                  'Real-time metrics, booking statistics, and studio capacity summary'}
                {activeTab === 'branches' &&
                  'Explore Rhythmic Beat Dance Court locations across Chennai'}
              </p>
            </div>
          </div>

          {/* Top Controls */}
          <div className="header-actions">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={
                  activeTab === 'bookings'
                    ? 'Search dancer, phone, ticket...'
                    : 'Search workshop title, date...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-dropdown-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">Filter by Status</option>
                {activeTab === 'bookings' ? (
                  <>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </>
                ) : (
                  <>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </>
                )}
              </select>
            </div>

            {/* Primary Action Button (Matches reference UI dark pill button) */}
            <button
              type="button"
              className="primary-cta-btn"
              onClick={openCreateModal}
            >
              <span>+</span> NEW WORKSHOP
            </button>
          </div>
        </header>

        {/* NOTIFICATION BANNER */}
        {statusMessage && (
          <div className={`status-banner ${statusType}`}>
            <span>{statusType === 'success' ? '✓' : statusType === 'error' ? '⚠️' : 'ℹ️'}</span>
            <p>{statusMessage}</p>
          </div>
        )}

        {/* METRICS ROW (When on Overview or Workshops) */}
        {(activeTab === 'overview' || activeTab === 'workshops') && (
          <div className="metrics-summary-grid">
            <div className="metric-box">
              <div className="metric-icon-wrap mint">💃</div>
              <div>
                <small>TOTAL WORKSHOPS</small>
                <h3>{metrics.totalWorkshops}</h3>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap orange">⚡</div>
              <div>
                <small>UPCOMING SESSIONS</small>
                <h3>{metrics.upcomingWorkshops}</h3>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap blue">🎟️</div>
              <div>
                <small>DANCER BOOKINGS</small>
                <h3>{metrics.totalBookings}</h3>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap teal">👥</div>
              <div>
                <small>TOTAL OPEN SLOTS</small>
                <h3>{metrics.totalSlots}</h3>
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY CONTAINER (Matches reference UI clean card table) */}
        <main className="saas-content-card">
          {/* TAB 1: ALL WORKSHOPS TABLE */}
          {activeTab === 'workshops' && (
            <div className="table-responsive">
              <table className="saas-data-table">
                <thead>
                  <tr>
                    <th>WORKSHOP & SONG</th>
                    <th>VENUE / BRANCH</th>
                    <th>DATE & TIME</th>
                    <th>PRICE / PASS</th>
                    <th>AVAILABLE SLOTS</th>
                    <th>STATUS</th>
                    <th className="text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEvents ? (
                    <tr>
                      <td colSpan="7" className="table-loading-cell">
                        <div className="table-spinner" />
                        <p>Loading workshops from database...</p>
                      </td>
                    </tr>
                  ) : filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="table-empty-cell">
                        <p>No workshops found matching your search.</p>
                        <button
                          type="button"
                          className="table-action-btn primary"
                          onClick={openCreateModal}
                        >
                          + Create First Workshop
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
                      <tr key={event._id} className="table-row">
                        {/* Title & Poster */}
                        <td>
                          <div className="workshop-info-cell">
                            {event.image ? (
                              <img
                                src={assetUrl(event.image)}
                                alt={event.title}
                                className="table-poster-thumb"
                              />
                            ) : (
                              <div className="table-poster-placeholder">💃</div>
                            )}
                            <div>
                              <strong className="workshop-title-text">
                                {event.title}
                              </strong>
                              <span className="song-subtitle-text">
                                🎵 {formatSongName(event.song)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Venue */}
                        <td>
                          <span className="venue-tag">Valasaravakkam, Chennai</span>
                        </td>

                        {/* Date & Time */}
                        <td>
                          <div className="datetime-cell">
                            <strong>{event.date || 'TBA'}</strong>
                            <small>{event.time || 'Schedule TBA'}</small>
                          </div>
                        </td>

                        {/* Price */}
                        <td>
                          <span className="fee-badge">{event.prize || '₹1,000'}</span>
                        </td>

                        {/* Slots */}
                        <td>
                          <div className="slots-cell">
                            <span className="slot-num">{event.slots ?? 0}</span>
                            <small>Slots Left</small>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`status-chip ${
                              (event.status || 'upcoming').toLowerCase()
                            }`}
                          >
                            {event.status || 'Upcoming'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="text-right">
                          <div className="row-action-buttons">
                            <button
                              type="button"
                              className="action-icon-btn edit"
                              title="Edit Workshop"
                              onClick={() => openEditModal(event)}
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              className="action-icon-btn delete"
                              title="Delete Workshop"
                              onClick={() => handleDeleteEvent(event._id, event.title)}
                            >
                              🗑️
                            </button>

                            <a
                              href={`/#ws-${event._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="action-icon-btn view"
                              title="View on Website"
                            >
                              👁️
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: BOOKINGS / REGISTRATIONS TABLE */}
          {activeTab === 'bookings' && (
            <div className="table-responsive">
              <table className="saas-data-table">
                <thead>
                  <tr>
                    <th>DANCER</th>
                    <th>WHATSAPP / CONTACT</th>
                    <th>WORKSHOP & PASS CODE</th>
                    <th>PASSES</th>
                    <th>DATE / REGISTERED</th>
                    <th>STATUS</th>
                    <th className="text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBookings ? (
                    <tr>
                      <td colSpan="7" className="table-loading-cell">
                        <div className="table-spinner" />
                        <p>Loading registrations from database...</p>
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="table-empty-cell">
                        <p>No dancer registrations recorded yet.</p>
                        <small>
                          When visitors fill the "Reserve Your Slot" popup on the website, their details appear here in real time.
                        </small>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b._id} className="table-row">
                        {/* Dancer Info with Avatar Circle (Like Reference UI) */}
                        <td>
                          <div className="dancer-info-cell">
                            <div className="dancer-initial-avatar">
                              {b.name ? b.name.charAt(0).toUpperCase() : 'D'}
                            </div>
                            <div>
                              <strong className="dancer-name-text">{b.name}</strong>
                              <small className="dancer-email-text">
                                {b.email || 'No email provided'}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp / Phone */}
                        <td>
                          <div className="phone-cell">
                            <span className="phone-number">{b.phone}</span>
                            <a
                              href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hi ${b.name}! Thank you for reserving pass #${b.ticketId} for "${b.eventTitle}" at Rhythmic Beat Dance Court. We look forward to seeing you!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="wa-chat-pill"
                            >
                              💬 WhatsApp
                            </a>
                          </div>
                        </td>

                        {/* Workshop & Pass */}
                        <td>
                          <div className="booking-workshop-cell">
                            <strong>{b.eventTitle || 'Dance Workshop'}</strong>
                            <span className="pass-code-pill">#{b.ticketId}</span>
                          </div>
                        </td>

                        {/* Slots */}
                        <td>
                          <span className="slot-count-badge">
                            {b.slots} {b.slots === 1 ? 'Pass' : 'Passes'}
                          </span>
                        </td>

                        {/* Date */}
                        <td>
                          <small className="date-text">
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleDateString('en-GB')
                              : b.date || 'Recent'}
                          </small>
                        </td>

                        {/* Status (Mint Green for Confirmed / Amber for Pending) */}
                        <td>
                          <span
                            className={`booking-status-chip ${
                              (b.status || 'pending').toLowerCase()
                            }`}
                          >
                            {b.status || 'Pending'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="text-right">
                          <div className="row-action-buttons">
                            <button
                              type="button"
                              className={`action-toggle-status-btn ${
                                b.status === 'Confirmed' ? 'confirmed' : 'pending'
                              }`}
                              title="Toggle Confirmed / Pending"
                              onClick={() => handleToggleBookingStatus(b)}
                            >
                              {b.status === 'Confirmed' ? '✓ Confirmed' : 'Mark Confirm'}
                            </button>

                            <button
                              type="button"
                              className="action-icon-btn delete"
                              title="Delete Registration"
                              onClick={() => handleDeleteBooking(b._id, b.name)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: OVERVIEW METRICS DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="overview-tab-content">
              <div className="overview-cards-row">
                <div className="overview-panel">
                  <h3>Recent Workshops</h3>
                  <div className="mini-event-list">
                    {events.slice(0, 4).map((ev) => (
                      <div key={ev._id} className="mini-event-row">
                        <div className="mini-title-box">
                          <strong>{ev.title}</strong>
                          <small>
                            {ev.date || 'TBA'} • {ev.slots} Slots Available
                          </small>
                        </div>
                        <span className={`status-chip ${(ev.status || 'upcoming').toLowerCase()}`}>
                          {ev.status || 'Upcoming'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overview-panel">
                  <h3>Recent Dancer Bookings</h3>
                  <div className="mini-event-list">
                    {bookings.length === 0 ? (
                      <p className="empty-subtext">No registrations yet.</p>
                    ) : (
                      bookings.slice(0, 4).map((b) => (
                        <div key={b._id} className="mini-event-row">
                          <div className="mini-title-box">
                            <strong>{b.name}</strong>
                            <small>
                              Pass #{b.ticketId} • {b.eventTitle}
                            </small>
                          </div>
                          <span className={`booking-status-chip ${(b.status || 'pending').toLowerCase()}`}>
                            {b.status || 'Pending'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDIO BRANCHES */}
          {activeTab === 'branches' && (
            <div className="branches-admin-grid">
              <div className="branch-admin-card">
                <div className="branch-header-badge">HEADQUARTERS & MAIN STAGE</div>
                <h3>Valasaravakkam Studio</h3>
                <p>
                  📍 42, Arcot Road, Near Mega Mart, Valasaravakkam, Chennai - 600087
                </p>
                <div className="branch-specs">
                  <span>✨ 1,800 sq.ft Wooden Spring Floor</span>
                  <span>🎥 4K Stage Lighting & Video Setup</span>
                  <span>❄️ Fully Air Conditioned</span>
                </div>
                <div className="branch-contact">
                  <strong>📞 Studio Helpline:</strong> +91 99947 16471
                </div>
              </div>

              <div className="branch-admin-card">
                <div className="branch-header-badge secondary">PRACTICE & CREW FLOOR</div>
                <h3>Kolapakkam Studio</h3>
                <p>
                  📍 15, VGN Boulevard, Near Max Hospital, Kolapakkam, Chennai - 600128
                </p>
                <div className="branch-specs">
                  <span>✨ 1,200 sq.ft Rehearsal Hall</span>
                  <span>🔊 Surround Acoustic System</span>
                  <span>🚗 Free Dancer Parking</span>
                </div>
                <div className="branch-contact">
                  <strong>📞 Studio Helpline:</strong> +91 99947 16471
                </div>
              </div>

              <div className="branch-admin-card">
                <div className="branch-header-badge secondary">UPCOMING EXPANSION</div>
                <h3>Ambattur Masterclass Branch</h3>
                <p>📍 MTH Road, Near Industrial Estate, Ambattur, Chennai - 600053</p>
                <div className="branch-specs">
                  <span>✨ Masterclass Arena</span>
                  <span>🏆 Battle Zone & Showcase Stage</span>
                  <span>👥 Capacity: 60+ Dancers</span>
                </div>
                <div className="branch-contact">
                  <strong>📞 Launching Soon:</strong> Reach out on WhatsApp
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT WORKSHOP MODAL OVERLAY */}
      {isModalOpen && (
        <div className="saas-modal-backdrop" onClick={closeModal}>
          <div
            className="saas-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top-bar">
              <div>
                <h2>{editingId ? 'Edit Workshop' : 'Create New Workshop'}</h2>
                <p>Fill in workshop details to publish to the live dance website.</p>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="saas-modal-form">
              <div className="modal-form-grid">
                {/* Title */}
                <div className="form-field full-width">
                  <label htmlFor="form-title">Workshop Title *</label>
                  <input
                    id="form-title"
                    name="title"
                    required
                    placeholder="e.g. Masterclass Choreography Battle"
                    value={form.title}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Name of Song */}
                <div className="form-field full-width">
                  <label htmlFor="form-song">Name of the Song / Track</label>
                  <input
                    id="form-song"
                    name="song"
                    placeholder="e.g. Arabic Kuthu - Anirudh Choreography"
                    value={form.song}
                    onChange={handleFormChange}
                  />
                  <small className="field-hint">
                    Song name will be displayed cleanly on the workshop page badge.
                  </small>
                </div>

                {/* Status */}
                <div className="form-field">
                  <label htmlFor="form-status">Status</label>
                  <select
                    id="form-status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Slots */}
                <div className="form-field">
                  <label htmlFor="form-slots">Available Slots</label>
                  <input
                    id="form-slots"
                    name="slots"
                    type="number"
                    min="0"
                    placeholder="20"
                    value={form.slots}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Price / Fee */}
                <div className="form-field">
                  <label htmlFor="form-prize">Registration Fee / Pass</label>
                  <input
                    id="form-prize"
                    name="prize"
                    placeholder="e.g. ₹1,000"
                    value={form.prize}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Date */}
                <div className="form-field">
                  <label htmlFor="form-date">Event Date</label>
                  <input
                    id="form-date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Time */}
                <div className="form-field">
                  <label htmlFor="form-time">Event Time</label>
                  <input
                    id="form-time"
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Description */}
                <div className="form-field full-width">
                  <label htmlFor="form-description">Workshop Description</label>
                  <textarea
                    id="form-description"
                    name="description"
                    rows="3"
                    placeholder="Describe choreography style, counts breakdown, and guidelines..."
                    value={form.description}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Poster Image File */}
                <div className="form-field">
                  <label htmlFor="form-image-file">
                    Workshop Poster (JPG, PNG, WEBP)
                  </label>
                  <input
                    id="form-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setImageFile(file || null);
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {imagePreview && (
                    <div className="image-preview-thumb">
                      <img src={imagePreview} alt="Workshop preview" />
                    </div>
                  )}
                </div>

                {/* Audio File */}
                <div className="form-field">
                  <label htmlFor="form-song-file">
                    Audio / Track File (Optional MP3/WAV)
                  </label>
                  <input
                    id="form-song-file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setSongFile(e.target.files?.[0] || null)}
                  />
                  {songFile && (
                    <small className="field-hint">Selected: {songFile.name}</small>
                  )}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={formLoading}
                >
                  {formLoading
                    ? 'Saving to Database...'
                    : editingId
                    ? 'Update Workshop'
                    : 'Create Workshop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
