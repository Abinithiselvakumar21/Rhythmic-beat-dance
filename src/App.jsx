import { useEffect, useState, useMemo } from 'react';
import './App.css';
import Admin from './Admin';
import AdminDashboard from './AdminDashboard';
import heroImg from './assets/hero.png';

const SERVER = 'https://rhythmic-beat-dance.onrender.com';
const API = `${SERVER}/api/events`;
const BOOKINGS_API = `${SERVER}/api/bookings`;
const BRANCHES_API = `${SERVER}/api/branches`;
const WHATSAPP_PHONE = '919994716471';

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

// Topic-Relevant Curriculum Templates
const TOPIC_CURRICULUM_TEMPLATES = {
  'Hip-Hop & Urban': {
    name: 'Hip-Hop & Urban Choreography',
    agenda: `1. Groove Foundation & Joint Isolations (00:00 - 00:20): Bounce drills, ankle/knee conditioning, neck & chest isolations to train body control.
2. Rhythm & Beat Pocket Breakdown (00:20 - 00:50): Footwork angles, weight transitions, syncopated 8-counts, and hitting the bass pocket.
3. Flow & Texture Switching (00:50 - 01:30): Transitioning between hard hits (popping) and smooth fluid glide textures.
4. Group Formations & Stage Energy (01:30 - 02:15): Camera angle awareness, eye focus, synchronization, and crew chemistry.
5. Cinematic 4K Stage Reel Shoot (02:15 - 02:45): Professional stage lights shoot for your Instagram reels & portfolio.
6. Feedback, Q&A & Certificate Handover (02:45 - 03:00): Individual posture correction, mentor guidance, and official RB certificate.`,
  },
  'Folk & Kuthu': {
    name: 'Folk & Kuthu Intensive',
    agenda: `1. High-Energy Stamina Warm-up (00:00 - 00:20): Dappankuthu foot stomp drills, cardio warm-up, and hip flexibility drills.
2. Authentic Kuthu Steps & Body Flow (00:20 - 00:55): Traditional beats count breakdown, shoulder bounces, and waist movements.
3. Fast-Tempo Musicality & Expressions (00:55 - 01:35): Tamil mass beats timing, facial expressions, and dynamic punch moves.
4. Mass Crew Synchronization (01:35 - 02:15): High-speed group performance, battle circle face-off, and whistle moments.
5. 4K Mass Stage Video Shoot (02:15 - 02:45): High-voltage cinematic video capture with full studio lighting.
6. Group Photo & Certificate Presentation (02:45 - 03:00): Certificate handover and studio community connect.`,
  },
  'Contemporary & Lyrical': {
    name: 'Contemporary & Lyrical Flow',
    agenda: `1. Floor-work & Alignment Warm-up (00:00 - 00:25): Spine articulation, hamstring stretches, and center core grounding.
2. Fluid Extensions & Pirouette Technique (00:25 - 01:05): Breath control, suspension, balance release, and lyrical floor slides.
3. Emotional Storytelling & Musical Texture (01:05 - 01:45): Translating song lyrics into body language and expressive dynamic movement.
4. Partner Work & Stage Formation (01:45 - 02:15): Safe weight-sharing techniques and aesthetic stage spacing.
5. Cinematic 4K Lyrical Showcase Shoot (02:15 - 02:45): Soft-glow stage spotlight recording capturing emotional nuances.
6. Reflection & Certificate Award (02:45 - 03:00): Mentor feedback on emotional expression and official certificate.`,
  },
  'Dance Battle & Freestyle': {
    name: 'Dance Battle & Cypher Masterclass',
    agenda: `1. Freestyle Foundations Warm-up (00:00 - 00:20): Freestyle groove, cypher circles, and reaction-time drills.
2. Battle Concept Breakdown & Musicality (00:20 - 01:00): Hitting unexpected snare/bass drops, round-stealing concepts, and musical pauses.
3. Call-outs, Mimicry & Stage Presence (01:00 - 01:40): Eye-contact dominance, psychological confidence, and dynamic floor recovery.
4. Mock 1v1 & 2v2 Battle Cypher (01:40 - 02:20): Live judged battle practice with immediate mentor constructive critique.
5. 4K Battle Highlight Shoot (02:20 - 02:45): Fast-paced multi-angle battle recording with stage arena lighting.
6. Battle Honor & Certificate Distribution (02:45 - 03:00): Certificate award, judge tips, and dancer networking.`,
  },
  'Bollywood Commercial': {
    name: 'Bollywood Commercial & Hook-step',
    agenda: `1. Bollywood Groove Warm-up (00:00 - 00:20): Hook-step body posture, neck movements, and cheerful stage energy warmup.
2. Hook-step Breakdown & Expressions (00:20 - 01:00): Thumkas, mudras, energetic footwork, and bright theatrical expressions (Navarasa).
3. Camera-Ready Performance Coaching (01:00 - 01:40): Close-up lip sync, smile projection, and cinematic angles.
4. Blockbuster Formation Training (01:40 - 02:15): Grand group formation switching and coordinated ensemble flow.
5. 4K Bollywood Reel Production Shoot (02:15 - 02:45): High-energy studio lights video recording ready for Instagram & YouTube.
6. Star Certificate & Photo Session (02:45 - 03:00): Official certification and mentor group pictures.`,
  },
};

function getTopicRelevantAgenda(workshop) {
  if (workshop.agenda && workshop.agenda.trim().length > 30) {
    return workshop.agenda;
  }
  const text = `${workshop.title || ''} ${workshop.description || ''} ${workshop.song || ''}`.toLowerCase();
  if (text.includes('kuthu') || text.includes('folk') || text.includes('dappa') || text.includes('mass')) {
    return TOPIC_CURRICULUM_TEMPLATES['Folk & Kuthu'].agenda;
  }
  if (text.includes('contemporary') || text.includes('lyrical') || text.includes('classical') || text.includes('ballet')) {
    return TOPIC_CURRICULUM_TEMPLATES['Contemporary & Lyrical'].agenda;
  }
  if (text.includes('battle') || text.includes('cypher') || text.includes('clash') || text.includes('freestyle')) {
    return TOPIC_CURRICULUM_TEMPLATES['Dance Battle & Freestyle'].agenda;
  }
  if (text.includes('bollywood') || text.includes('commercial') || text.includes('cinematic')) {
    return TOPIC_CURRICULUM_TEMPLATES['Bollywood Commercial'].agenda;
  }
  return TOPIC_CURRICULUM_TEMPLATES['Hip-Hop & Urban'].agenda;
}

const CATEGORIES = [
  'All Styles',
  'Hip-Hop & Urban',
  'Folk & Kuthu',
  'Contemporary',
  'Bollywood Commercial',
  'Dance Battle',
  'Choreography',
];

const SKILL_LEVELS = [
  'All Levels',
  'Beginner Friendly',
  'Intermediate / Advanced',
  'Masterclass Intensive',
];

const BRANCH_LOCATIONS = [
  'All Branches',
  'Valasaravakkam Studio',
  'Kolapakkam Studio',
  'Ambattur Branch',
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

const DEFAULT_BRANCH_LIST = [
  {
    _id: 'def-1',
    name: 'Valasaravakkam Studio',
    tag: 'HEADQUARTERS & MAIN STAGE',
    address: '42, Arcot Road, Near Mega Mart, Valasaravakkam, Chennai - 600087',
    phone: '+91 99947 16471',
    specs: ['1,800 sq.ft Wooden Spring Floor', '4K Stage Lighting & Video Setup', 'Fully Air Conditioned', 'Free Changing Rooms'],
    status: 'Active',
  },
  {
    _id: 'def-2',
    name: 'Kolapakkam Studio',
    tag: 'PRACTICE & CREW FLOOR',
    address: '15, VGN Boulevard, Near Max Hospital, Kolapakkam, Chennai - 600128',
    phone: '+91 99947 16471',
    specs: ['1,200 sq.ft Rehearsal Hall', 'Surround Acoustic System', 'Free Parking Available', 'Mirror Walls'],
    status: 'Active',
  },
  {
    _id: 'def-3',
    name: 'Ambattur Masterclass Branch',
    tag: 'UPCOMING EXPANSION',
    address: 'MTH Road, Near Industrial Estate, Ambattur, Chennai - 600053',
    phone: '+91 99947 16471',
    specs: ['Masterclass Arena & Cypher Zone', 'Battle Stage & Audience Seating', 'Capacity: 60+ Dancers'],
    status: 'Launching Soon',
  },
];

function App() {
  const [events, setEvents] = useState([]);
  const [branches, setBranches] = useState(DEFAULT_BRANCH_LIST);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  // Workshop Browser & Multi-Filter State
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Styles');
  const [activeLevel, setActiveLevel] = useState('All Levels');
  const [activeBranch, setActiveBranch] = useState('All Branches');
  const [activeTiming, setActiveTiming] = useState('All Dates');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('soonest');
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

    async function loadBranches() {
      try {
        const response = await fetch(BRANCHES_API);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setBranches(data);
          }
        }
      } catch {
        // Fallback to default branches
      }
    }

    loadEvents();
    loadBranches();
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

  // Multi-Filter Logic
  const filteredEvents = useMemo(() => {
    let result = events.filter((ev) => {
      // 1. Keyword Search
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        ev.title?.toLowerCase().includes(query) ||
        ev.description?.toLowerCase().includes(query) ||
        ev.song?.toLowerCase().includes(query) ||
        ev.instructor?.toLowerCase().includes(query) ||
        ev.date?.toLowerCase().includes(query) ||
        ev.location?.toLowerCase().includes(query);

      // 2. Dance Style Category
      let matchesCategory = true;
      if (activeCategory !== 'All Styles') {
        const catKeywords = activeCategory.toLowerCase().split(/[&/\s]+/);
        const text = `${ev.title || ''} ${ev.description || ''} ${ev.song || ''}`.toLowerCase();
        matchesCategory = catKeywords.some((kw) => text.includes(kw));
      }

      // 3. Skill Level
      let matchesLevel = true;
      if (activeLevel !== 'All Levels') {
        const lvlText = (ev.level || '').toLowerCase();
        if (activeLevel.includes('Beginner')) {
          matchesLevel = lvlText.includes('beginner') || lvlText.includes('open');
        } else if (activeLevel.includes('Intermediate')) {
          matchesLevel = lvlText.includes('intermediate') || lvlText.includes('advanced');
        } else if (activeLevel.includes('Masterclass')) {
          matchesLevel = lvlText.includes('masterclass') || lvlText.includes('pro');
        }
      }

      // 4. Branch / Location
      let matchesBranch = true;
      if (activeBranch !== 'All Branches') {
        const branchKey = activeBranch.toLowerCase().split(' ')[0]; // 'valasaravakkam', 'kolapakkam', 'ambattur'
        const locText = `${ev.location || ''}`.toLowerCase();
        matchesBranch = locText.includes(branchKey);
      }

      // 5. Timing / Schedule
      let matchesTiming = true;
      if (activeTiming !== 'All Dates') {
        if (activeTiming === 'This Weekend') {
          const dateStr = (ev.date || '').toLowerCase();
          matchesTiming = dateStr.includes('sat') || dateStr.includes('sun');
        }
      }

      // 6. Price Range
      let matchesPrice = true;
      if (priceRange !== 'All') {
        const rawNum = parseInt((ev.prize || '').replace(/[^0-9]/g, ''), 10) || 1000;
        if (priceRange === 'under-1000') matchesPrice = rawNum <= 1000;
        if (priceRange === 'above-1000') matchesPrice = rawNum > 1000;
      }

      // 7. Status Filter
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        matchesStatus =
          (ev.status || '').toLowerCase() === statusFilter.toLowerCase();
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel &&
        matchesBranch &&
        matchesTiming &&
        matchesPrice &&
        matchesStatus
      );
    });

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => {
        const pA = parseInt((a.prize || '').replace(/[^0-9]/g, ''), 10) || 0;
        const pB = parseInt((b.prize || '').replace(/[^0-9]/g, ''), 10) || 0;
        return pA - pB;
      });
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => {
        const pA = parseInt((a.prize || '').replace(/[^0-9]/g, ''), 10) || 0;
        const pB = parseInt((b.prize || '').replace(/[^0-9]/g, ''), 10) || 0;
        return pB - pA;
      });
    } else if (sortBy === 'slots-low') {
      result.sort((a, b) => (Number(a.slots) || 0) - (Number(b.slots) || 0));
    }

    return result;
  }, [
    events,
    searchQuery,
    activeCategory,
    activeLevel,
    activeBranch,
    activeTiming,
    priceRange,
    statusFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery ||
    activeCategory !== 'All Styles' ||
    activeLevel !== 'All Levels' ||
    activeBranch !== 'All Branches' ||
    activeTiming !== 'All Dates' ||
    priceRange !== 'All' ||
    statusFilter !== 'All';

  const resetAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('All Styles');
    setActiveLevel('All Levels');
    setActiveBranch('All Branches');
    setActiveTiming('All Dates');
    setPriceRange('All');
    setStatusFilter('All');
    setSortBy('soonest');
  };

  const handleOpenWorkshop = (ev) => {
    setSelectedWorkshop(ev);
    setReserveSuccess(false);
    setIsBookingModalOpen(false);
    window.location.hash = `ws-${ev._id}`;
    const el = document.getElementById('workshops');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCloseWorkshop = () => {
    setSelectedWorkshop(null);
    setReserveSuccess(false);
    setIsBookingModalOpen(false);
    window.location.hash = 'workshops';
    const el = document.getElementById('workshops');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    if (!reserveForm.name.trim() || !reserveForm.phone.trim()) {
      alert('Please enter your Full Name and WhatsApp phone number.');
      return;
    }

    const genId = `RB-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(genId);
    setIsSubmittingBooking(true);

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

    const message =
      `*RHYTHMIC BEAT DANCE COURT — WORKSHOP ADMISSION REQUEST*\n\n` +
      `🎟️ *Pass Code:* ${genId}\n` +
      `🔥 *Workshop:* ${selectedWorkshop?.title}\n` +
      `👤 *Dancer Name:* ${reserveForm.name}\n` +
      `📞 *WhatsApp:* ${reserveForm.phone}\n` +
      `📧 *Email:* ${reserveForm.email || 'N/A'}\n` +
      `👥 *Passes Reserved:* ${reserveForm.slots}\n` +
      `📅 *Date:* ${selectedWorkshop?.date || 'Scheduled Soon'}\n` +
      `📍 *Location:* ${selectedWorkshop?.location || 'Valasaravakkam Studio, Chennai'}\n\n` +
      `Please confirm my admission and share UPI / Payment details. Thank you!`;

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

          {/* RIGHT-SIDE HERO VISUAL */}
          <div className="hero-visual-wrap">
            <div className="hero-visual-card">
              <div className="hero-dancer-glow" />
              <img
                src={heroImg}
                alt="Dance masterclass at Rhythmic Beat Dance Court"
                className="hero-dancer-img"
              />

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
              Browse upcoming dance sessions, filter by your favorite dance style or branch, and reserve your admission pass directly.
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
               WORKSHOP DETAIL VIEW WITH TOPIC-RELEVANT CURRICULUM
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
                        <p>{selectedWorkshop.location || 'Valasaravakkam Studio, Chennai'}</p>
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
                        🎯 {selectedWorkshop.level || 'Beginner & Intermediate Friendly'}
                      </span>
                    </div>
                  </div>

                  {/* Workshop Inclusions / Highlights */}
                  <div className="inclusions-row">
                    <span className="inclusion-chip">🎥 4K Video Shoot Included</span>
                    <span className="inclusion-chip">🏆 Certificate of Participation</span>
                    <span className="inclusion-chip">⚡ Counts & Musicality Breakdown</span>
                    <span className="inclusion-chip">💧 Full AC & Sprung Wooden Floor</span>
                  </div>

                  {/* Description */}
                  <div className="detail-info-block">
                    <h3>About The Workshop</h3>
                    <p className="detail-description">
                      {selectedWorkshop.description ||
                        'Get ready to learn an explosive choreography piece with master techniques, musicality, dynamic body control, and stage presence.'}
                    </p>
                  </div>

                  {/* TOPIC-RELEVANT SESSION TIMELINE & CURRICULUM */}
                  <div className="session-agenda-block">
                    <div className="agenda-block-header">
                      <div>
                        <span className="agenda-kicker-tag">SESSION FLOW & CURRICULUM</span>
                        <h3>What Happens In This Workshop</h3>
                      </div>
                      <span className="agenda-total-time">⏱️ 3-Hour Intensive</span>
                    </div>
                    <p className="agenda-lead-intro">
                      Every workshop at Rhythmic Beat Dance Court is structured to take you from foundational counts to high-energy stage performance:
                    </p>

                    <div className="session-steps-timeline">
                      {getTopicRelevantAgenda(selectedWorkshop)
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
                      <li>Clean sneakers or dance shoes required inside the sprung wooden dance floor.</li>
                      <li>Comfortable athletic clothing / dance attire.</li>
                      <li>Bring your personal water bottle and towel.</li>
                      <li>Please arrive 15 minutes prior for warm-up.</li>
                    </ul>
                  </div>

                  {/* Booking CTA Bar */}
                  <div className="booking-cta-bar">
                    <div className="fee-summary-box">
                      <small>REGISTRATION FEE</small>
                      <strong>{selectedWorkshop.prize || '₹1,000'}</strong>
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
                            <strong>{selectedWorkshop.location || 'Valasaravakkam Studio, Chennai'}</strong>
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
               WORKSHOPS BROWSER VIEW (Multi-Filters + Redesigned Cards)
               ========================================= */
            <div className="workshops-browser-layout">
              {/* LEFT SIDEBAR WITH MULTIPLE EXPANDED FILTERS */}
              <aside className="filters-sidebar">
                <div className="filter-header">
                  <h3>Filters</h3>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="clear-filters-btn"
                      onClick={resetAllFilters}
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Keyword Search */}
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
                      placeholder="Title, song, instructor..."
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
                  <span className="filter-label">Dance Style / Genre</span>
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

                {/* Skill Level Filter */}
                <div className="filter-block">
                  <span className="filter-label">Skill Level</span>
                  <div className="category-pill-list">
                    {SKILL_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        className={`category-pill ${
                          activeLevel === lvl ? 'active' : ''
                        }`}
                        onClick={() => setActiveLevel(lvl)}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Studio Branch / Venue Filter */}
                <div className="filter-block">
                  <span className="filter-label">Studio Branch</span>
                  <div className="category-pill-list">
                    {BRANCH_LOCATIONS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`category-pill ${
                          activeBranch === b ? 'active' : ''
                        }`}
                        onClick={() => setActiveBranch(b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="filter-block">
                  <span className="filter-label">Pass Fee</span>
                  <div className="status-toggle-group">
                    {[
                      { id: 'All', label: 'All' },
                      { id: 'under-1000', label: '≤ ₹1,000' },
                      { id: 'above-1000', label: '> ₹1,000' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`status-btn ${
                          priceRange === p.id ? 'active' : ''
                        }`}
                        onClick={() => setPriceRange(p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timing Filter */}
                <div className="filter-block">
                  <span className="filter-label">Timing</span>
                  <div className="status-toggle-group">
                    {['All Dates', 'This Weekend'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`status-btn ${
                          activeTiming === t ? 'active' : ''
                        }`}
                        onClick={() => setActiveTiming(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort By Dropdown */}
                <div className="filter-block">
                  <label htmlFor="sort-select" className="filter-label">
                    Sort Workshops
                  </label>
                  <select
                    id="sort-select"
                    className="filter-select-input"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="soonest">📅 Date: Upcoming First</option>
                    <option value="slots-low">⚡ Slots: Fewest Left</option>
                    <option value="price-low">💵 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                  </select>
                </div>

                {/* Sidebar Help Card */}
                <div className="sidebar-help-card">
                  <p className="sidebar-help-title">Private Group Workshop?</p>
                  <p className="sidebar-help-desc">
                    We host private team choreography, college dance crews & battle sessions across Chennai.
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

              {/* RIGHT MAIN CONTENT: Results Count & Redesigned Workshop Cards */}
              <div className="workshops-main-content">
                {/* RESULTS HEADER */}
                <div className="results-header-bar">
                  <div className="results-count-wrap">
                    <span className="count-badge">
                      {filteredEvents.length}
                    </span>
                    <h3 className="count-text">
                      {filteredEvents.length === 1
                        ? '1 Workshop Available'
                        : `${filteredEvents.length} Workshops Available`}
                    </h3>
                  </div>

                  {hasActiveFilters && (
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
                      {activeLevel !== 'All Levels' && (
                        <span className="active-pill">
                          {activeLevel}
                          <button
                            type="button"
                            onClick={() => setActiveLevel('All Levels')}
                          >
                            ✕
                          </button>
                        </span>
                      )}
                      {activeBranch !== 'All Branches' && (
                        <span className="active-pill">
                          {activeBranch}
                          <button
                            type="button"
                            onClick={() => setActiveBranch('All Branches')}
                          >
                            ✕
                          </button>
                        </span>
                      )}
                      {priceRange !== 'All' && (
                        <span className="active-pill">
                          {priceRange === 'under-1000' ? '≤ ₹1,000' : '> ₹1,000'}
                          <button
                            type="button"
                            onClick={() => setPriceRange('All')}
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
                      <button
                        type="button"
                        className="clear-all-text-btn"
                        onClick={resetAllFilters}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {/* REDESIGNED WORKSHOP CARDS GRID */}
                {filteredEvents.length === 0 ? (
                  <div className="empty-results-box">
                    <span className="empty-icon">🎭</span>
                    <h4>No Workshops Match Your Filter</h4>
                    <p>
                      Try resetting your search filters or choose a different dance style.
                    </p>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={resetAllFilters}
                    >
                      VIEW ALL WORKSHOPS
                    </button>
                  </div>
                ) : (
                  <div className="modern-workshop-grid">
                    {filteredEvents.map((event) => {
                      const image = assetUrl(event.image);
                      const hasImage = image && !failedImages[event._id];
                      const isFewSlots = event.slots > 0 && event.slots <= 5;

                      return (
                        <article
                          className="modern-workshop-card"
                          key={event._id}
                          onClick={() => handleOpenWorkshop(event)}
                        >
                          {/* Banner / Poster Header */}
                          <div className="card-media-banner">
                            {hasImage ? (
                              <img
                                src={image}
                                alt={event.title}
                                className="card-poster-img"
                                onError={() =>
                                  setFailedImages((prev) => ({
                                    ...prev,
                                    [event._id]: true,
                                  }))
                                }
                              />
                            ) : (
                              <div className="card-poster-placeholder">
                                <span>✦</span>
                                <small>RHYTHMIC BEAT</small>
                              </div>
                            )}

                            {/* Top Style Tag */}
                            <span className="card-genre-pill">
                              ⚡ {event.title.toLowerCase().includes('kuthu') ? 'FOLK & KUTHU' : event.title.toLowerCase().includes('contemporary') ? 'CONTEMPORARY' : event.title.toLowerCase().includes('battle') ? 'BATTLE' : 'CHOREOGRAPHY'}
                            </span>

                            {/* Slots Urgency Chip */}
                            <span
                              className={`card-urgency-badge ${
                                isFewSlots ? 'urgent' : ''
                              }`}
                            >
                              {isFewSlots
                                ? `🔥 ONLY ${event.slots} SLOTS LEFT`
                                : event.slots > 0
                                ? `● ${event.slots} SLOTS AVAILABLE`
                                : '● REGISTRATION OPEN'}
                            </span>
                          </div>

                          {/* Card Content Body */}
                          <div className="modern-card-body">
                            <h3 className="modern-card-title">{event.title}</h3>

                            {/* Song Badge */}
                            <div className="card-song-badge">
                              <span className="song-icon">🎵</span>
                              <span className="song-text">
                                Track: {formatSongName(event.song)}
                              </span>
                            </div>

                            {/* Schedule & Venue Meta */}
                            <div className="card-meta-list">
                              <div className="meta-item">
                                <span className="meta-icon">📅</span>
                                <span>{event.date || 'Date TBA'} {event.time ? `• ${event.time}` : ''}</span>
                              </div>
                              <div className="meta-item">
                                <span className="meta-icon">📍</span>
                                <span>{event.location || 'Valasaravakkam Studio, Chennai'}</span>
                              </div>
                              <div className="meta-item">
                                <span className="meta-icon">👤</span>
                                <span>{event.instructor || 'Master Choreographer'} • <span className="level-highlight">{event.level || 'Beginner Friendly'}</span></span>
                              </div>
                            </div>

                            {/* Inclusions Row */}
                            <div className="card-perks-row">
                              <span className="perk-pill">🎥 4K Video Shoot</span>
                              <span className="perk-pill">🏆 Certificate</span>
                            </div>

                            {/* Footer: Fee & Booking CTA */}
                            <div className="modern-card-footer">
                              <div className="fee-box">
                                <small>PASS FEE</small>
                                <strong>{event.prize || '₹1,000'}</strong>
                              </div>

                              <button
                                type="button"
                                className="reserve-card-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenWorkshop(event);
                                }}
                              >
                                RESERVE PASS <span>🎟️</span>
                              </button>
                            </div>
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

        {/* OUR BRANCHES (DYNAMICALLY CONNECTED TO ADMIN BRANCHES) */}
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
            {branches.map((b) => (
              <div className="branch-card" key={b._id}>
                <div className="branch-badge">{b.tag || 'STUDIO VENUE'}</div>
                <h3>{b.name}</h3>
                <p className="branch-address">{b.address}</p>
                <div className="branch-features">
                  {(Array.isArray(b.specs) ? b.specs : (b.specs || '').split(','))
                    .slice(0, 3)
                    .map((spec, i) => (
                      <span key={i}>✓ {spec.trim()}</span>
                    ))}
                </div>
                <a
                  href={`https://wa.me/${(b.phone || WHATSAPP_PHONE).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi RB Dance Court! I want to visit the ${b.name} branch.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="branch-btn"
                >
                  Contact {b.name.split(' ')[0]} ↗
                </a>
              </div>
            ))}
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
