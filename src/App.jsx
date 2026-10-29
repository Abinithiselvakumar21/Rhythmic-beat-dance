import { useEffect, useState, useMemo } from 'react';
import './App.css';
import Admin from './Admin';
import AdminDashboard from './AdminDashboard';
import heroImg from './assets/hero.png';

const SERVER = 'https://rhythmic-beat-dance.onrender.com';
const API = `${SERVER}/api/events`;
const BOOKINGS_API = `${SERVER}/api/bookings`;
const WHATSAPP_PHONE = '919994716471'; // Updated RB Dance Court Official WhatsApp

function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER}/${path.replace(/^\/+/, '')}`;
}

function formatSongName(songPath) {
  if (!songPath || songPath.trim() === '') {
    return 'Special Event Choreography Track';
  }
  const clean = songPath.split('/').pop().replace(/\.[^/.]+$/, '');
  const formatted = clean.replace(/^\d+[-_]?/, '').replace(/[-_]+/g, ' ').trim();
  return formatted
    ? formatted.replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Special Event Choreography Track';
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

const FAQS = [
  {
    q: 'Are these choreography workshops suitable for beginners?',
    a: 'Yes, absolutely! Our choreographers break down routines step-by-step with counts, musicality, and body-isolation exercises before moving to full speed. Both beginners and intermediate dancers learn smoothly.',
  },
  {
    q: 'What should I wear and bring to the dance court?',
    a: 'Wear comfortable athletic attire (sweatpants, oversized t-shirt, leggings) and clean dance sneakers or running shoes. Please bring your personal water bottle and hand towel.',
  },
  {
    q: 'How does payment confirmation work after I reserve my pass?',
    a: 'When you submit the booking form, your details are instantly registered in our database, and WhatsApp opens automatically. Our coordinator will provide instant UPI / GPay payment details or confirm cash on spot.',
  },
  {
    q: 'Will I receive a video recording of the routine?',
    a: 'Yes! At the end of every workshop, we conduct a professional 4K studio video shoot with stage lights. You will receive full high-definition video access to post on Instagram/YouTube.',
  },
  {
    q: 'Can I transfer my pass to a friend if I cannot attend?',
    a: 'Yes, if you inform our studio coordinator on WhatsApp at least 12 hours prior to the workshop, we can easily transfer your pass code to a friend or credit it towards the next workshop.',
  },
];

const REVIEWS = [
  {
    name: 'Priya Mahalingam',
    style: 'Hip-Hop & Urban',
    rating: 5,
    comment: 'The energy at Rhythmic Beat Dance Court is unreal! The mentors break down complex choreography so effortlessly. Loved the wooden floor vibe!',
    date: 'October 2026',
  },
  {
    name: 'Karthik Saravanan',
    style: 'Folk & Kuthu Intensive',
    rating: 5,
    comment: 'Attended the special choreography battle workshop. The musicality tips and stage presentation training were gold. 100% recommended for dancers!',
    date: 'September 2026',
  },
  {
    name: 'Ananya Ramesh',
    style: 'Contemporary & Lyrical',
    rating: 5,
    comment: 'Joint-safe wooden floors make such a huge difference! Trained for 3 hours with zero ankle fatigue. Studio facilities and AC are top-class.',
    date: 'October 2026',
  },
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

  // Booking Modal & Reservation State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [reserveForm, setReserveForm] = useState({
    name: '',
    phone: '',
    email: '',
    slots: 1,
    notes: '',
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // FAQ Accordion Active State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

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

  // Sync hash routing with selected workshop
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
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        ev.title?.toLowerCase().includes(query) ||
        ev.description?.toLowerCase().includes(query) ||
        ev.date?.toLowerCase().includes(query) ||
        ev.time?.toLowerCase().includes(query);

      let matchesCategory = true;
      if (activeCategory !== 'All Styles') {
        const catKeywords = activeCategory.toLowerCase().split(/[&/\s]+/);
        const text = `${ev.title || ''} ${ev.description || ''}`.toLowerCase();
        matchesCategory = catKeywords.some((kw) => text.includes(kw));
      }

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
    setIsBookingModalOpen(false);
    window.location.hash = `ws-${ev._id}`;
    const el = document.getElementById('workshops');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Back to list
  const handleCloseWorkshop = () => {
    setSelectedWorkshop(null);
    setReserveSuccess(false);
    setIsBookingModalOpen(false);
    window.location.hash = 'workshops';
    const el = document.getElementById('workshops');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Reservation Submit in Popup
  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    if (!reserveForm.name.trim() || !reserveForm.phone.trim()) {
      alert('Please enter your Full Name and WhatsApp phone number.');
      return;
    }

    const genId = `RB-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(genId);
    setIsSubmittingBooking(true);

    // Save directly into MongoDB Backend
    try {
      await fetch(BOOKINGS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reserveForm.name.trim(),
          phone: reserveForm.phone.trim(),
          email: reserveForm.email.trim(),
          eventId: selectedWorkshop?._id || '',
          eventTitle: selectedWorkshop?.title || '',
          slots: Number(reserveForm.slots) || 1,
          ticketId: genId,
          date: selectedWorkshop?.date || '',
        }),
      });
    } catch (err) {
      console.warn('Booking offline fallback:', err);
    } finally {
      setIsSubmittingBooking(false);
      setReserveSuccess(true);
    }

    // Pre-fill WhatsApp message to Studio coordinator
    const message = `*RHYTHMIC BEAT DANCE COURT — WORKSHOP ADMISSION REQUEST*\n\n` +
      `🎟️ *Pass Code:* ${genId}\n` +
      `🔥 *Workshop:* ${selectedWorkshop?.title}\n` +
      `👤 *Dancer Name:* ${reserveForm.name}\n` +
      `📞 *WhatsApp:* ${reserveForm.phone}\n` +
      `📧 *Email:* ${reserveForm.email || 'N/A'}\n` +
      `👥 *Passes Reserved:* ${reserveForm.slots}\n` +
      `📅 *Date:* ${selectedWorkshop?.date || 'Scheduled Soon'}\n` +
      `📍 *Location:* Valasaravakkam Branch, Chennai\n\n` +
      `Please confirm my admission and share UPI/Payment instructions. Thank you!`;

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="app">
      {/* FLOATING QUICK WHATSAPP CHAT BUTTON */}
      <a
        href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20Rhythmic%20Beat%20Dance%20Court!%20I%20have%20an%20enquiry.`}
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp-widget"
        aria-label="Chat with Studio on WhatsApp"
      >
        <span className="wa-icon">💬</span>
        <span className="wa-text">Chat on WhatsApp</span>
      </a>

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
          <a href="#about" onClick={closeMenu}>About Us</a>
          <a href="#branches" onClick={closeMenu}>Branches</a>
          <a href="#reviews" onClick={closeMenu}>Reviews</a>
          <a href="#faq" onClick={closeMenu}>FAQ</a>
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
        {/* HERO SECTION WITH DYNAMIC RIGHT-SIDE VISUAL */}
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
              high-voltage workshops, and professional stage training led by industry-leading dancers.
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
                <span>Chennai Branches</span>
              </div>
              <div className="stat-separator" />
              <div className="stat-item">
                <strong>50+</strong>
                <span>Workshops Conducted</span>
              </div>
            </div>
          </div>

          {/* RIGHT-SIDE HERO VISUAL SHOWCASE */}
          <div className="hero-visual-wrap">
            <div className="hero-visual-card">
              <div className="hero-dancer-glow" />
              <img
                src={heroImg}
                alt="Dance masterclass at Rhythmic Beat Dance Court"
                className="hero-dancer-img"
              />

              {/* Floating Glass Badges */}
              <div className="floating-hero-pill top-pill">
                <span className="pulse-red-dot" />
                <span>LIVE BATCHES & WORKSHOPS</span>
              </div>

              <div className="floating-hero-card bottom-card">
                <div className="card-badge-icon">🏆</div>
                <div>
                  <strong>Official RB Dance Pass</strong>
                  <small>Valasaravakkam • Kolapakkam • Ambattur</small>
                </div>
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
               OPTION 1: BOOKMYSHOW / EVENTBRITE PRO STYLE
               ========================================= */
            <div className="option1-detail-container">
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

              <div className="eventbrite-card-wrapper">
                {/* LEFT: POSTER CARD */}
                <div className="eventbrite-poster-box">
                  <div className="poster-frame">
                    {assetUrl(selectedWorkshop.image) && !failedImages[selectedWorkshop._id] ? (
                      <>
                        <img
                          src={assetUrl(selectedWorkshop.image)}
                          alt={selectedWorkshop.title}
                          className="poster-bg-blur"
                          aria-hidden="true"
                        />
                        <img
                          src={assetUrl(selectedWorkshop.image)}
                          alt={selectedWorkshop.title}
                          className="poster-img"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [selectedWorkshop._id]: true,
                            }))
                          }
                        />
                      </>
                    ) : (
                      <div className="poster-placeholder">
                        <span>✦</span>
                        <p>RHYTHMIC BEAT DANCE COURT</p>
                      </div>
                    )}
                    <span className="poster-tag">
                      {selectedWorkshop.status || 'OPEN FOR BOOKING'}
                    </span>
                  </div>
                </div>

                {/* RIGHT: WORKSHOP DETAILS */}
                <div className="eventbrite-info-col">
                  <h1 className="eventbrite-title">{selectedWorkshop.title}</h1>

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
<p>
  {selectedWorkshop.location || 'Location to be announced'}
</p>                      </div>
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

                  {/* Clean "Name of the Song" display */}
                  <div className="song-detail-box">
                    <span className="song-badge-icon">🎵</span>
                    <div>
                      <small className="song-badge-label">NAME OF THE SONG / CHOREOGRAPHY TRACK</small>
                      <p className="song-badge-title">
                        {formatSongName(selectedWorkshop.song)}
                      </p>
                    </div>
                  </div>

                  {/* Lead Choreographer & Level Card */}
                  <div className="mentor-lead-card">
                    <div className="mentor-icon-box">💃</div>
                    <div className="mentor-text">
                      <span className="mentor-role-label">LEAD CHOREOGRAPHER & FACULTY</span>
                      <h4 className="mentor-name">
                        {selectedWorkshop.instructor || 'Master Choreographer Rahul & RB Crew'}
                      </h4>
                      <span className="level-badge">
                        🎯 {selectedWorkshop.level || 'Open Level (Beginner & Intermediate Friendly)'}
                      </span>
                    </div>
                  </div>

                  {/* Workshop Inclusions / Highlights */}
                  <div className="inclusions-row">
                    <span className="inclusion-chip">🎥 4K Video Shoot Included</span>
                    <span className="inclusion-chip">🏆 Certificate of Participation</span>
                    <span className="inclusion-chip">⚡ Counts & Musicality Breakdown</span>
                    <span className="inclusion-chip">💧 Full AC & Wooden Floor</span>
                  </div>

                  {/* Description */}
                  <div className="detail-info-block">
                    <h3>About The Workshop</h3>
                    <p className="detail-description">
                      {selectedWorkshop.description ||
                        'Get ready to learn an explosive choreography piece with master techniques, musicality, dynamic body control, and stage presence.'}
                    </p>
                  </div>

                  {/* WHAT HAPPENS IN THIS WORKSHOP (SESSION TIMELINE & BREAKDOWN) */}
                  <div className="session-agenda-block">
                    <div className="agenda-block-header">
                      <div>
                        <span className="agenda-kicker-tag">SESSION FLOW & CURRICULUM</span>
                        <h3>What Happens In This Workshop</h3>
                      </div>
                      <span className="agenda-total-time">⏱️ 3-Hour Intensive</span>
                    </div>
                    <p className="agenda-lead-intro">
                      Every workshop at Rhythmic Beat Dance Court is structured to take you from basic counts to high-energy stage performance. Here is how your session unfolds:
                    </p>

                    <div className="session-steps-timeline">
                      {(selectedWorkshop.agenda || `1. Warm-up & Body Isolations (00:00 - 00:20): Dynamic joint activation, neck/chest/pelvic isolations & rhythm groove.
2. Step-by-Step Choreography Breakdown (00:20 - 01:15): Detailed counts breakdown, hand precision, footwork angles & weight transitions.
3. Musicality & Texture Training (01:15 - 01:45): Matching beats, syncopated rhythms, hitting hard accents, and fluid body roll control.
4. Stage Formations & Group Synchronization (01:45 - 02:15): Camera angle awareness, eye contact, expressions, and clean group synchronization.
5. Professional 4K Stage Video Shoot (02:15 - 02:45): High-definition cinematic spotlight video recording for your Instagram reels & portfolio!
6. Mentor Feedback & Certificate Distribution (02:45 - 03:00): One-on-one personal guidance, dancer networking, and official RB certificate.`)
                        .split('\n')
                        .filter((l) => l.trim())
                        .map((line, idx) => {
                          const cleanLine = line.replace(/^\d+[\.\)]\s*/, '');
                          const colonIdx = cleanLine.indexOf(':');
                          const title = colonIdx > -1 ? cleanLine.substring(0, colonIdx) : cleanLine;
                          const desc = colonIdx > -1 ? cleanLine.substring(colonIdx + 1).trim() : '';

                          const stepIcons = ['⚡', '💃', '🎵', '👥', '🎥', '🏆'];
                          const icon = stepIcons[idx % stepIcons.length];

                          return (
                            <div key={idx} className="timeline-step-card">
                              <div className="step-badge-col">
                                <div className="step-circle-icon">{icon}</div>
                                <span className="step-label-pill">Phase 0{idx + 1}</span>
                              </div>
                              <div className="step-text-col">
                                <h4>{title}</h4>
                                {desc && <p>{desc}</p>}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

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

                  {/* Booking CTA Bar */}
                  <div className="booking-cta-bar">
                    <div className="fee-summary-box">
                      <small>REGISTRATION FEE</small>
                      <strong>{selectedWorkshop.prize || 'Contact Studio'}</strong>
                    </div>

                    <button
                      type="button"
                      className="open-booking-modal-btn"
                      onClick={() => {
                        setReserveSuccess(false);
                        setIsBookingModalOpen(true);
                      }}
                    >
                      BOOK YOUR SLOT NOW <span>🎟️</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BOOKING POPUP MODAL */}
              {isBookingModalOpen && (
                <div
                  className="modal-overlay"
                  onClick={() => setIsBookingModalOpen(false)}
                >
                  <div
                    className="booking-modal-card"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="modal-close-btn"
                      aria-label="Close booking popup"
                      onClick={() => setIsBookingModalOpen(false)}
                    >
                      ✕
                    </button>

                    {reserveSuccess ? (
                      <div className="modal-confirmed-content">
                        <div className="confirmed-badge">✓ SLOT RESERVED</div>
                        <h3>Pass Claimed Successfully!</h3>
                        <p className="confirmed-desc">
                          Your pass code is <strong>#{ticketId}</strong>. We've saved your registration to our database and opened WhatsApp to finalize your booking with our team.
                        </p>

                        <div className="ticket-voucher">
                          <div className="voucher-row">
                            <span>WORKSHOP:</span>
                            <strong>{selectedWorkshop.title}</strong>
                          </div>
                          <div className="voucher-row">
                            <span>DANCER:</span>
                            <strong>{reserveForm.name}</strong>
                          </div>
                          <div className="voucher-row">
                            <span>PASSES:</span>
                            <strong>{reserveForm.slots} Slot(s)</strong>
                          </div>
                          <div className="voucher-row">
                            <span>LOCATION:</span>
                            <strong>Valasaravakkam Branch, Chennai</strong>
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
                          onClick={() => {
                            setReserveSuccess(false);
                            setIsBookingModalOpen(false);
                          }}
                        >
                          Close Window
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="modal-header">
                          <span className="modal-tag">ADMISSION PASS</span>
                          <h3>Reserve Your Slot</h3>
                          <p className="modal-workshop-name">
                            {selectedWorkshop.title} •{' '}
                            <span>{selectedWorkshop.prize || 'Fee on Request'}</span>
                          </p>
                        </div>

                        <form
                          className="reserve-form"
                          onSubmit={handleReserveSubmit}
                        >
                          {/* Quick Slot Selector */}
                          <div className="form-group">
                            <label>Quantity of Passes</label>
                            <div className="slot-quick-selector">
                              {[1, 2, 3, 4].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  className={`slot-pill-btn ${
                                    reserveForm.slots === num ? 'active' : ''
                                  }`}
                                  onClick={() =>
                                    setReserveForm({
                                      ...reserveForm,
                                      slots: num,
                                    })
                                  }
                                >
                                  {num} {num === 1 ? 'Pass' : 'Passes'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="modal-name">Full Name *</label>
                            <input
                              id="modal-name"
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
                            <label htmlFor="modal-phone">WhatsApp Number *</label>
                            <input
                              id="modal-phone"
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
                            <label htmlFor="modal-email">Email (Optional)</label>
                            <input
                              id="modal-email"
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

                          <button
                            type="submit"
                            className="reserve-submit-btn"
                            disabled={isSubmittingBooking}
                          >
                            {isSubmittingBooking ? (
                              'SECURING YOUR PASS...'
                            ) : (
                              <>
                                CONFIRM & CLAIM TICKET <span>🎟️</span>
                              </>
                            )}
                          </button>
                        </form>

                        <div className="modal-footer-help">
                          <p>
                            Have queries?{' '}
                            <a
                              href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20have%20questions%20about%20${encodeURIComponent(
                                selectedWorkshop.title
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Chat on WhatsApp
                            </a>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
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

                {/* Help Box in Sidebar */}
                <div className="sidebar-help-card">
                  <p className="sidebar-help-title">Private Masterclass?</p>
                  <p className="sidebar-help-desc">
                    We host college teams, corporate workshops & private groups across Chennai.
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
                {/* RESULTS HEADER */}
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
                          </div>

                          {/* Info Body */}
                          <div className="compact-card-body">
                            <h3 className="compact-card-title">{event.title}</h3>

                            <div className="compact-card-meta-row">
{event.location && (
  <div className="meta-location">
    📍 {event.location}
  </div>
)}

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
                              View Details & Book <span>↗</span>
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

        {/* ABOUT US SECTION */}
        <section className="why-us-section" id="about">
          <div className="section-header-box centered">
            <span className="section-kicker">THE RHYTHMIC BEAT STANDARD</span>
            <h2>
              ABOUT <span>US.</span>
            </h2>
            <p className="section-subtitle">
              Built by dancers, for dancers. A creative court designed to elevate your craft across Chennai.
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

        {/* REVIEWS & DANCER TESTIMONIALS SECTION */}
        <section className="reviews-section" id="reviews">
          <div className="section-header-box centered">
            <span className="section-kicker">DANCER FEEDBACK</span>
            <h2>
              VOICES FROM THE <span>COURT.</span>
            </h2>
            <p className="section-subtitle">
              Real stories and experiences from dancers who trained and showcased with us.
            </p>
          </div>

          <div className="reviews-grid">
            {REVIEWS.map((rev, idx) => (
              <div className="review-card" key={idx}>
                <div className="review-stars">{'★'.repeat(rev.rating)}</div>
                <p className="review-comment">"{rev.comment}"</p>
                <div className="review-author-wrap">
                  <div className="author-avatar">{rev.name.charAt(0)}</div>
                  <div>
                    <strong>{rev.name}</strong>
                    <small>{rev.style} • {rev.date}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OUR BRANCHES */}
        <section className="branches-section" id="branches">
          <div className="section-header-box centered">
            <span className="section-kicker">CONVENIENT CHENNAI LOCATIONS</span>
            <h2>
              OUR <span>BRANCHES.</span>
            </h2>
            <p className="section-subtitle">
              Fully air-conditioned facilities with sprung wooden floors and professional surround acoustics.
            </p>
          </div>

          <div className="branches-grid">
            <div className="branch-card">
              <div className="branch-badge">MAIN BRANCH</div>
              <h3>Valasaravakkam Branch</h3>
              <p className="branch-address">
                No. 12, Arcot Road, Valasaravakkam, Chennai - 600087
              </p>
              <div className="branch-features">
                <span>✓ Sprung Wooden Floor</span>
                <span>✓ Pro Acoustics</span>
                <span>✓ Full AC</span>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20want%20to%20visit%20Valasaravakkam%20Branch.`}
                target="_blank"
                rel="noreferrer"
                className="branch-btn"
              >
                Contact Valasaravakkam ↗
              </a>
            </div>

            <div className="branch-card">
              <div className="branch-badge">BRANCH 2</div>
              <h3>Kolapakkam Branch</h3>
              <p className="branch-address">
                Main Road, Near Max Hospital, Kolapakkam, Chennai - 600122
              </p>
              <div className="branch-features">
                <span>✓ Spacious Practice Hall</span>
                <span>✓ Mirror Wall</span>
                <span>✓ Parking Available</span>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20want%20to%20visit%20Kolapakkam%20Branch.`}
                target="_blank"
                rel="noreferrer"
                className="branch-btn"
              >
                Contact Kolapakkam ↗
              </a>
            </div>

            <div className="branch-card">
              <div className="branch-badge">BRANCH 3</div>
              <h3>Ambattur Branch</h3>
              <p className="branch-address">
                MTH Road, Opp. Bus Terminus, Ambattur, Chennai - 600053
              </p>
              <div className="branch-features">
                <span>✓ Battle Court Area</span>
                <span>✓ Changing Rooms</span>
                <span>✓ Full AC</span>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20want%20to%20visit%20Ambattur%20Branch.`}
                target="_blank"
                rel="noreferrer"
                className="branch-btn"
              >
                Contact Ambattur ↗
              </a>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="faq-section" id="faq">
          <div className="section-header-box centered">
            <span className="section-kicker">QUESTIONS & ANSWERS</span>
            <h2>
              FREQUENTLY ASKED <span>QUESTIONS.</span>
            </h2>
            <p className="section-subtitle">
              Everything you need to know about registrations, studio rules, and workshop sessions.
            </p>
          </div>

          <div className="faq-accordion-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                >
                  <button
                    type="button"
                    className="faq-question-btn"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
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
            <a href="#about">About Us</a>
            <a href="#branches">Our Branches</a>
            <a href="#reviews">Dancer Reviews</a>
            <a href="#faq">FAQ</a>
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
              <strong>Studio Hotline:</strong> +91 99947 16471
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
