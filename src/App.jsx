import { useEffect, useState, useMemo } from 'react';
import './App.css';
import Admin from './Admin';
import AdminDashboard from './AdminDashboard';

const SERVER = 'https://rhythmic-beat-dance.onrender.com';
const API = `${SERVER}/api/events`;
const WHATSAPP_PHONE = '919940428809'; // RB Dance Court Official WhatsApp

function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER}/${path.replace(/^\/+/, '')}`;
}

const CATEGORIES = [
  'All Styles',
  'Choreography',
  'Hip-Hop',
  'Folk & Kuthu',
  'Contemporary',
  'Bollywood',
  'Freestyle',
];

function App() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  // Workshop Browser & Filter State
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Styles');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Slot Reservation State
  const [reserveForm, setReserveForm] = useState({
    name: '',
    phone: '',
    email: '',
    slots: 1,
    notes: '',
  });
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Load events from backend
  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch(API);
        if (!response.ok) throw new Error('Unable to load events');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid events response');
        setEvents(data);
        setEventsError('');
      } catch {
        setEventsError('Events load aagala. Please try again in a moment.');
      } finally {
        setEventsLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Sync hash routing with selected workshop (e.g. #ws-123 or #ws-choreo-ishwarya)
  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#ws-')) {
        const targetId = hash.replace('#ws-', '');
        const found = events.find(
          (e) =>
            e._id === targetId ||
            e.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetId
        );
        if (found) {
          setSelectedWorkshop(found);
          const el = document.getElementById('workshops');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (hash === '#workshops' || hash === '#events') {
        setSelectedWorkshop(null);
      }
    }

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [events]);

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/admin-dashboard') {
    if (!sessionStorage.getItem('adminToken')) {
      window.location.replace('/admin');
      return null;
    }
    return <AdminDashboard />;
  }

  if (pathname === '/admin') {
    return <Admin />;
  }

  const closeMenu = () => setMenuOpen(false);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Search filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        ev.title?.toLowerCase().includes(query) ||
        ev.description?.toLowerCase().includes(query) ||
        ev.date?.toLowerCase().includes(query) ||
        ev.time?.toLowerCase().includes(query);

      // Category filter
      let matchesCategory = true;
      if (activeCategory !== 'All Styles') {
        const catKeywords = activeCategory.toLowerCase().split(/[&/\s]+/);
        const text = `${ev.title || ''} ${ev.description || ''}`.toLowerCase();
        matchesCategory = catKeywords.some((kw) => text.includes(kw));
      }

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        matchesStatus =
          (ev.status || '').toLowerCase() === statusFilter.toLowerCase();
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, searchQuery, activeCategory, statusFilter]);

  // Click on a workshop card
  const handleOpenWorkshop = (ev) => {
    setSelectedWorkshop(ev);
    setReserveSuccess(false);
    window.location.hash = `ws-${ev._id}`;
    const el = document.getElementById('workshops');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Back to list
  const handleCloseWorkshop = () => {
    setSelectedWorkshop(null);
    setReserveSuccess(false);
    window.location.hash = 'workshops';
    const el = document.getElementById('workshops');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Reservation Submit
  const handleReserveSubmit = (e) => {
    e.preventDefault();
    if (!reserveForm.name.trim() || !reserveForm.phone.trim()) {
      alert('Please enter your Full Name and WhatsApp phone number.');
      return;
    }

    const genId = `RB-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(genId);
    setReserveSuccess(true);

    // Pre-fill WhatsApp message
    const message = `*RHYTHMIC BEAT DANCE COURT — WORKSHOP PASS CONFIRMATION*\n\n` +
      `🎟️ *Pass Code:* ${genId}\n` +
      `🔥 *Workshop:* ${selectedWorkshop?.title}\n` +
      `👤 *Dancer Name:* ${reserveForm.name}\n` +
      `📞 *WhatsApp:* ${reserveForm.phone}\n` +
      `📧 *Email:* ${reserveForm.email || 'N/A'}\n` +
      `👥 *Slots Reserved:* ${reserveForm.slots}\n` +
      `📅 *Date:* ${selectedWorkshop?.date || 'Scheduled Soon'}\n` +
      `📍 *Location:* Valasaravakkam Studio, Chennai\n\n` +
      `Please confirm my admission and provide payment link. Thank you!`;

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <a
          href="#home"
          className="brand-logo"
          aria-label="Rhythmic Beat Dance Court home"
          onClick={closeMenu}
        >
          <img src="/dance-logo.png" alt="Rhythmic Beat Dance Court" />
        </a>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#workshops" onClick={closeMenu}>Workshops</a>
          <a href="#why-us" onClick={closeMenu}>Why RB</a>
          <a href="#studios" onClick={closeMenu}>Studios</a>
          <a
            className="whatsapp-nav-btn"
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20Rhythmic%20Beat%20Dance%20Court!%20I%20have%20an%20enquiry.`}
            target="_blank"
            rel="noreferrer"
            onClick={closeMenu}
          >
            <span>💬</span> WhatsApp Enquire
          </a>
          <a className="admin-link" href="/admin" onClick={closeMenu}>
            Admin ↗
          </a>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow-badge">THE STAGE IS YOURS • CHENNAI</span>

            <h1>
              FEEL THE <span className="accent-red">BEAT.</span>
              <br />
              OWN THE <span className="highlight-text">STAGE.</span>
            </h1>

            <p className="hero-text">
              Welcome to Rhythmic Beat Dance Court. Experience masterclass choreography,
              high-energy workshops, and professional stage training led by industry-leading dancers.
            </p>

            <div className="hero-actions">
              <a className="primary-btn" href="#workshops">
                EXPLORE WORKSHOPS <span>↓</span>
              </a>
              <a
                className="secondary-btn"
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20want%20to%20join%20a%20regular%20dance%20batch.`}
                target="_blank"
                rel="noreferrer"
              >
                JOIN REGULAR BATCH <span>↗</span>
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <strong>1,500+</strong>
                <span>Dancers Trained</span>
              </div>
              <div className="stat-separator" />
              <div className="stat-item">
                <strong>3</strong>
                <span>Chennai Studios</span>
              </div>
              <div className="stat-separator" />
              <div className="stat-item">
                <strong>50+</strong>
                <span>Workshops Conducted</span>
              </div>
            </div>
          </div>
        </section>

        {/* WORKSHOPS & MASTERCLASSES SECTION */}
        <section className="workshops-section" id="workshops">
          <div className="section-header-box">
            <span className="section-kicker">FEATURED SESSIONS</span>
            <h2>
              THE <span>WORKSHOPS.</span>
            </h2>
            <p className="section-subtitle">
              Browse upcoming dance sessions, select your style, and reserve your admission pass directly.
            </p>
          </div>

          {eventsLoading ? (
            <div className="state-feedback-card">
              <div className="spinner" />
              <p>Loading dance workshops...</p>
            </div>
          ) : eventsError ? (
            <div className="state-feedback-card error">
              <p>{eventsError}</p>
              <button
                type="button"
                className="primary-btn"
                onClick={() => window.location.reload()}
              >
                TRY AGAIN ↻
              </button>
            </div>
          ) : selectedWorkshop ? (
            /* =========================================
               WORKSHOP DETAIL VIEW (like rbdancecourt.com/#ws-...)
               ========================================= */
            <div className="workshop-detail-container">
              <div className="detail-top-nav">
                <button
                  type="button"
                  className="back-btn"
                  onClick={handleCloseWorkshop}
                >
                  ← Back to All Workshops
                </button>
                <span className="detail-status-pill">
                  {selectedWorkshop.status || 'Upcoming Workshop'}
                </span>
              </div>

              <div className="workshop-detail-grid">
                {/* LEFT COLUMN: Workshop In-depth Info */}
                <div className="detail-main-content">
                  <div className="detail-banner-wrap">
                    {assetUrl(selectedWorkshop.image) && !failedImages[selectedWorkshop._id] ? (
                      <img
                        src={assetUrl(selectedWorkshop.image)}
                        alt={selectedWorkshop.title}
                        className="detail-banner-img"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [selectedWorkshop._id]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="detail-banner-placeholder">
                        <span>✦</span>
                        <p>RHYTHMIC BEAT DANCE COURT</p>
                      </div>
                    )}
                    <span className="banner-tag">
                      {selectedWorkshop.status || 'OPEN FOR BOOKING'}
                    </span>
                  </div>

                  <h1 className="detail-title">{selectedWorkshop.title}</h1>

                  {/* Highlights Grid */}
                  <div className="detail-specs-grid">
                    <div className="spec-item">
                      <span className="spec-icon">📅</span>
                      <div>
                        <small>DATE</small>
                        <p>{selectedWorkshop.date || 'To be announced'}</p>
                      </div>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">⏰</span>
                      <div>
                        <small>TIME</small>
                        <p>{selectedWorkshop.time || 'Schedule TBA'}</p>
                      </div>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">📍</span>
                      <div>
                        <small>STUDIO VENUE</small>
                        <p>Valasaravakkam & Kolapakkam, Chennai</p>
                      </div>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">⚡</span>
                      <div>
                        <small>AVAILABLE SLOTS</small>
                        <p>
                          {selectedWorkshop.slots > 0
                            ? `${selectedWorkshop.slots} Slots Left`
                            : 'Open Registration'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="detail-info-block">
                    <h3>About The Workshop</h3>
                    <p className="detail-description">
                      {selectedWorkshop.description ||
                        'Get ready to learn an explosive choreography piece with master techniques, musicality, dynamic body control, and stage presence.'}
                    </p>
                  </div>

                  {/* Audio track preview */}
                  {selectedWorkshop.song && (
                    <div className="detail-audio-box">
                      <div className="audio-header">
                        <span className="audio-icon">♫</span>
                        <div>
                          <strong>Official Workshop Track</strong>
                          <p>Listen to the track you will be dancing to</p>
                        </div>
                      </div>
                      <audio controls preload="none">
                        <source src={assetUrl(selectedWorkshop.song)} />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}

                  {/* What to Bring */}
                  <div className="detail-guidelines-box">
                    <h4>What to bring & instructions:</h4>
                    <ul>
                      <li>Clean sneakers or dance shoes required inside the wooden dance floor.</li>
                      <li>Comfortable athletic clothing / dance attire.</li>
                      <li>Bring your personal water bottle and towel.</li>
                      <li>Please arrive 15 minutes prior to warm-up.</li>
                    </ul>
                  </div>
                </div>

                {/* RIGHT COLUMN: Creative VIP Dance Pass Card */}
                <aside className="detail-sidebar-col">
                  <div className="ticket-pass-card">
                    <div className="ticket-top-notch">
                      <div className="ticket-brand">
                        <span>🎟️ ADMISSION PASS</span>
                        <small>RHYTHMIC BEAT</small>
                      </div>
                      <div className="ticket-price-box">
                        <span className="price-label">FEE</span>
                        <strong className="price-val">
                          {selectedWorkshop.prize || 'Contact Studio'}
                        </strong>
                      </div>
                    </div>

                    <div className="ticket-divider">
                      <span className="notch-left" />
                      <span className="dashed-line" />
                      <span className="notch-right" />
                    </div>

                    <div className="ticket-body">
                      <div className="urgency-banner">
                        <span className="pulse-dot" />
                        <span>
                          {selectedWorkshop.slots > 0
                            ? `Only ${selectedWorkshop.slots} Passes Remaining!`
                            : 'Open Admissions • Fast Filling!'}
                        </span>
                      </div>

                      {reserveSuccess ? (
                        <div className="ticket-confirmed-box">
                          <div className="confirmed-badge">✓ PASS CLAIMED</div>
                          <h4>You're Registered!</h4>
                          <p className="confirmed-sub">
                            Your pass code is <strong>#{ticketId}</strong>. We've
                            opened WhatsApp to finalize your booking with our team.
                          </p>

                          <div className="mini-ticket-summary">
                            <div>
                              <small>DANCER</small>
                              <p>{reserveForm.name}</p>
                            </div>
                            <div>
                              <small>PASSES</small>
                              <p>{reserveForm.slots} Slot(s)</p>
                            </div>
                          </div>

                          <a
                            className="whatsapp-reserve-btn"
                            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                              `Hi RB Dance Court! I have reserved pass #${ticketId} for: ${selectedWorkshop.title}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            💬 Send Pass via WhatsApp
                          </a>

                          <button
                            type="button"
                            className="reset-form-btn"
                            onClick={() => setReserveSuccess(false)}
                          >
                            Book Another Pass
                          </button>
                        </div>
                      ) : (
                        <form
                          className="reserve-form"
                          onSubmit={handleReserveSubmit}
                        >
                          {/* Quick Slot Selector */}
                          <div className="form-group">
                            <label>Select Quantity of Passes</label>
                            <div className="slot-quick-selector">
                              {[1, 2, 3, 4].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  className={`slot-pill-btn ${
                                    reserveForm.slots === num ? 'active' : ''
                                  }`}
                                  onClick={() =>
                                    setReserveForm({ ...reserveForm, slots: num })
                                  }
                                >
                                  {num} {num === 1 ? 'Pass' : 'Passes'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="res-name">Full Name *</label>
                            <input
                              id="res-name"
                              type="text"
                              placeholder="e.g. Rahul Sharma"
                              required
                              value={reserveForm.name}
                              onChange={(e) =>
                                setReserveForm({
                                  ...reserveForm,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="res-phone">WhatsApp Number *</label>
                            <input
                              id="res-phone"
                              type="tel"
                              placeholder="e.g. 9876543210"
                              required
                              value={reserveForm.phone}
                              onChange={(e) =>
                                setReserveForm({
                                  ...reserveForm,
                                  phone: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="res-email">Email (Optional)</label>
                            <input
                              id="res-email"
                              type="email"
                              placeholder="dancer@gmail.com"
                              value={reserveForm.email}
                              onChange={(e) =>
                                setReserveForm({
                                  ...reserveForm,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>

                          <button type="submit" className="reserve-submit-btn">
                            CONFIRM & CLAIM PASS <span>🎟️</span>
                          </button>
                        </form>
                      )}

                      <div className="reserve-footer-assistance">
                        <p>Need assistance or have queries?</p>
                        <a
                          href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20have%20questions%20about%20${encodeURIComponent(
                            selectedWorkshop.title
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="chat-wa-link"
                        >
                          💬 Chat With Studio Coordinator
                        </a>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          ) : (
            /* =========================================
               WORKSHOPS BROWSER VIEW (Sidebar Filters + Cards Grid)
               ========================================= */
            <div className="workshops-browser-layout">
              {/* LEFT SIDEBAR FILTERS */}
              <aside className="filters-sidebar">
                <div className="filter-header">
                  <h3>Filters</h3>
                  {(searchQuery ||
                    activeCategory !== 'All Styles' ||
                    statusFilter !== 'All') && (
                    <button
                      type="button"
                      className="clear-filters-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('All Styles');
                        setStatusFilter('All');
                      }}
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="filter-block">
                  <label htmlFor="workshop-search" className="filter-label">
                    Search Workshop
                  </label>
                  <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                      id="workshop-search"
                      type="text"
                      className="filter-search-input"
                      placeholder="Choreo, style, date..."
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
                </div>

                {/* Dance Style / Category */}
                <div className="filter-block">
                  <span className="filter-label">Dance Style</span>
                  <div className="category-pill-list">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`category-pill ${
                          activeCategory === cat ? 'active' : ''
                        }`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="filter-block">
                  <span className="filter-label">Status</span>
                  <div className="status-toggle-group">
                    {['All', 'Upcoming', 'Ongoing'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`status-btn ${
                          statusFilter === st ? 'active' : ''
                        }`}
                        onClick={() => setStatusFilter(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Studio Help Box in Sidebar */}
                <div className="sidebar-help-card">
                  <p className="sidebar-help-title">Private Masterclass?</p>
                  <p className="sidebar-help-desc">
                    We host college teams, corporate workshops & private groups.
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20am%20looking%20for%20a%20private%20workshop.`}
                    target="_blank"
                    rel="noreferrer"
                    className="sidebar-wa-btn"
                  >
                    Enquire on WhatsApp ↗
                  </a>
                </div>
              </aside>

              {/* RIGHT MAIN CONTENT: Results Count & Cards Grid */}
              <div className="workshops-main-content">
                {/* RESULTS HEADER (e.g. 1 Workshop Found) */}
                <div className="results-header-bar">
                  <div className="results-count-wrap">
                    <span className="count-badge">
                      {filteredEvents.length}
                    </span>
                    <h3 className="count-text">
                      {filteredEvents.length === 1
                        ? '1 Workshop Found'
                        : `${filteredEvents.length} Workshops Found`}
                    </h3>
                  </div>

                  {(activeCategory !== 'All Styles' || searchQuery) && (
                    <div className="active-tag-pills">
                      {activeCategory !== 'All Styles' && (
                        <span className="active-pill">
                          {activeCategory}
                          <button
                            type="button"
                            onClick={() => setActiveCategory('All Styles')}
                          >
                            ✕
                          </button>
                        </span>
                      )}
                      {searchQuery && (
                        <span className="active-pill">
                          "{searchQuery}"
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                          >
                            ✕
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* CARDS GRID */}
                {filteredEvents.length === 0 ? (
                  <div className="empty-results-box">
                    <span className="empty-icon">🎭</span>
                    <h4>No Workshops Match Your Filter</h4>
                    <p>
                      Try resetting your search or choose a different dance style.
                    </p>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('All Styles');
                        setStatusFilter('All');
                      }}
                    >
                      VIEW ALL WORKSHOPS
                    </button>
                  </div>
                ) : (
                  <div className="compact-workshop-grid">
                    {filteredEvents.map((event) => {
                      const image = assetUrl(event.image);
                      const hasImage = image && !failedImages[event._id];

                      return (
                        <article
                          className="compact-card"
                          key={event._id}
                          onClick={() => handleOpenWorkshop(event)}
                        >
                          {/* Banner / Poster */}
                          <div className="compact-card-media">
                            {hasImage ? (
                              <img
                                src={image}
                                alt={event.title}
                                className="compact-card-img"
                                onError={() =>
                                  setFailedImages((prev) => ({
                                    ...prev,
                                    [event._id]: true,
                                  }))
                                }
                              />
                            ) : (
                              <div className="compact-card-placeholder">
                                <span>✦</span>
                                <small>RHYTHMIC BEAT</small>
                              </div>
                            )}

                            <span className="card-status-badge">
                              {event.status || 'UPCOMING'}
                            </span>

                            {event.song && (
                              <span className="card-has-audio-badge" title="Has Audio Track">
                                ♫ Track
                              </span>
                            )}
                          </div>

                          {/* Info Body */}
                          <div className="compact-card-body">
                            <h3 className="compact-card-title">{event.title}</h3>

                            <div className="compact-card-meta-row">
                              {(event.date || event.time) && (
                                <span className="meta-schedule">
                                  📅 {event.date || 'TBA'}
                                  {event.time ? ` · ${event.time}` : ''}
                                </span>
                              )}
                            </div>

                            <p className="compact-card-desc">
                              {event.description ||
                                'Step onto the court and master unique choreography techniques with expert instructors.'}
                            </p>

                            <div className="compact-card-footer">
                              <div className="fee-info">
                                <small>FEE</small>
                                <strong>{event.prize || 'Contact'}</strong>
                              </div>

                              <div className="slots-info">
                                <small>SLOTS</small>
                                <span className="slots-chip">
                                  {event.slots > 0 ? `${event.slots} left` : 'Open'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="view-workshop-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWorkshop(event);
                              }}
                            >
                              Reserve Your Slot <span>↗</span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* WHY CHOOSE RHYTHMIC BEAT */}
        <section className="why-us-section" id="why-us">
          <div className="section-header-box centered">
            <span className="section-kicker">THE RHYTHMIC BEAT STANDARD</span>
            <h2>
              WHY TRAIN WITH <span>US?</span>
            </h2>
            <p className="section-subtitle">
              Built by dancers, for dancers. A creative court designed to elevate your craft.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h3>Celebrity & Pro Mentors</h3>
              <p>
                Learn industry choreography, musicality, and stage confidence directly from top artists.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">✨</span>
              <h3>Joint-Safe Wooden Floors</h3>
              <p>
                Professional cushioned sprung wooden floors designed to protect your joints during intensive routines.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">🔥</span>
              <h3>Stage & Battle Exposure</h3>
              <p>
                Direct opportunities for state competitions, studio showcase video shoots, and performance battles.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">🤝</span>
              <h3>All Skill Levels Welcome</h3>
              <p>
                Whether you are stepping onto the floor for the first time or training for pro performances.
              </p>
            </div>
          </div>
        </section>

        {/* STUDIO LOCATIONS */}
        <section className="studios-section" id="studios">
          <div className="section-header-box centered">
            <span className="section-kicker">OUR CHENNAI BRANCHES</span>
            <h2>
              VISIT OUR <span>STUDIOS.</span>
            </h2>
            <p className="section-subtitle">
              Fully air-conditioned facilities with surround sound systems and ample practice spaces.
            </p>
          </div>

          <div className="studios-grid">
            <div className="studio-card">
              <div className="studio-badge">MAIN BRANCH</div>
              <h3>Valasaravakkam Studio</h3>
              <p className="studio-address">
                No. 12, Arcot Road, Valasaravakkam, Chennai - 600087
              </p>
              <div className="studio-features">
                <span>✓ Sprung Wooden Floor</span>
                <span>✓ Pro Acoustics</span>
                <span>✓ Full AC</span>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20want%20to%20visit%20Valasaravakkam%20Studio.`}
                target="_blank"
                rel="noreferrer"
                className="studio-btn"
              >
                Contact Valasaravakkam ↗
              </a>
            </div>

            <div className="studio-card">
              <div className="studio-badge">BRANCH 2</div>
              <h3>Kolapakkam Studio</h3>
              <p className="studio-address">
                Main Road, Near Max Hospital, Kolapakkam, Chennai - 600122
              </p>
              <div className="studio-features">
                <span>✓ Spacious Practice Hall</span>
                <span>✓ Mirror Wall</span>
                <span>✓ Parking Available</span>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20want%20to%20visit%20Kolapakkam%20Studio.`}
                target="_blank"
                rel="noreferrer"
                className="studio-btn"
              >
                Contact Kolapakkam ↗
              </a>
            </div>

            <div className="studio-card">
              <div className="studio-badge">BRANCH 3</div>
              <h3>Ambattur Studio</h3>
              <p className="studio-address">
                MTH Road, Opp. Bus Terminus, Ambattur, Chennai - 600053
              </p>
              <div className="studio-features">
                <span>✓ Battle Court Area</span>
                <span>✓ Changing Rooms</span>
                <span>✓ Full AC</span>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20want%20to%20visit%20Ambattur%20Studio.`}
                target="_blank"
                rel="noreferrer"
                className="studio-btn"
              >
                Contact Ambattur ↗
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <a href="#home" className="footer-logo">
              <img src="/dance-logo.png" alt="Rhythmic Beat Dance Court" />
            </a>
            <p className="footer-tagline">
              One stage. Endless moves. Unforgettable moments.
              Chennai's premier platform for aspiring and professional dancers.
            </p>
            <div className="footer-social-row">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                💬 WhatsApp
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                📸 Instagram
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#workshops">All Workshops</a>
            <a href="#why-us">Why Choose Us</a>
            <a href="#studios">Studio Locations</a>
            <a href="/admin">Admin Login ↗</a>
          </div>

          <div className="footer-col">
            <h4>Dance Disciplines</h4>
            <span>Choreography Masterclasses</span>
            <span>Hip-Hop & Urban Styles</span>
            <span>Folk & South Indian Kuthu</span>
            <span>Contemporary & Lyrical</span>
            <span>Bollywood & Freestyle</span>
          </div>

          <div className="footer-col">
            <h4>Support & Help</h4>
            <p className="footer-contact-item">
              <strong>Studio Hotline:</strong> +91 99404 28809
            </p>
            <p className="footer-contact-item">
              <strong>Studio Hours:</strong> Mon - Sun: 7:00 AM - 9:30 PM
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20need%20assistance.`}
              target="_blank"
              rel="noreferrer"
              className="footer-chat-btn"
            >
              24/7 WhatsApp Chat ↗
            </a>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© 2026 RHYTHMIC BEAT DANCE COURT. ALL RIGHTS RESERVED.</p>
          <a href="#home">BACK TO TOP ↑</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
