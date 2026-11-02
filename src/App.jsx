import { useEffect, useState, useMemo } from 'react';
import './App.css';
import Admin from './Admin';
import AdminDashboard from './AdminDashboard';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Zap,
  UserRound,
  UsersRound,
  MessageCircle,
  Menu,
  X,
  ArrowRight,
  Music2,
  Trophy,
  Sparkles,
  Flame,
  Handshake,
  Video,
  Award,
  Headphones,
  Droplets,
  Camera,
  Target,
  Timer,
  Users,
  Ticket,
  Search,
  Drama,
} from 'lucide-react';

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

// Topic-Relevant Curriculum Templates Tailored to Dance Topics
const TOPIC_CURRICULUM_TEMPLATES = {
  'Hip-Hop & Urban': {
    name: 'Hip-Hop & Urban Choreography',
    agenda: `1. Groove Foundation & Joint Isolations (00:00 - 00:20): Bounce drills, ankle/knee conditioning, neck & chest isolations to build body control.
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



// Dance Workshop Specific Categories
const WORKSHOP_GENRES = [
  'Hip-Hop & Urban',
  'Folk & Kuthu',
  'Contemporary',
  'Bollywood Commercial',
  'Dance Battle',
  'Choreography',
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



const SPECIFIC_BRANCHES = [
  "Valasaravakkam",
  "Ambattur",
  "Kolapakkam"
];


const SKILL_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'All Levels',
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/workshop/:workshopId" element={<AppContent />} />
        <Route path="/admin" element={<AppContent />} />
        <Route path="/admin-dashboard" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}




function AppContent() {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [branches, setBranches] = useState(DEFAULT_BRANCH_LIST);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [failedImages, setFailedImages] = useState({});

// Filter State
const [selectedWorkshop, setSelectedWorkshop] = useState(null);
const [selectedGenre, setSelectedGenre] = useState('');
const [searchQuery, setSearchQuery] = useState('');
const [selectedBranch, setSelectedBranch] = useState('');
const [selectedLevel, setSelectedLevel] = useState('');
const [priceFilter, setPriceFilter] = useState('');
const [sortBy, setSortBy] = useState('soonest');

  // Booking Modal State
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

  // Load events & branches from backend
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

  // Sync selected workshop with both URL params (/workshop/:workshopId) and hash (#ws-:id)
  useEffect(() => {
    function resolveTargetWorkshop() {
      const hash = window.location.hash || '';
      let targetId = workshopId;
      if (!targetId && hash.startsWith('#ws-')) {
        targetId = hash.replace('#ws-', '');
      }

      if (!targetId) {
        if (!workshopId && !hash.startsWith('#ws-')) {
          setSelectedWorkshop(null);
        }
        return;
      }

      const found = events.find((ev) => String(ev._id) === String(targetId));
      if (found) {
        setSelectedWorkshop(found);
      }
    }

    resolveTargetWorkshop();
    window.addEventListener('hashchange', resolveTargetWorkshop);
    return () => window.removeEventListener('hashchange', resolveTargetWorkshop);
  }, [workshopId, events]);

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

 // Filter Logic
const filteredEvents = useMemo(() => {
  const filtered = events.filter((ev) => {
    // Keyword Search
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      ev.title?.toLowerCase().includes(query) ||
      ev.description?.toLowerCase().includes(query) ||
      ev.song?.toLowerCase().includes(query) ||
      ev.instructor?.toLowerCase().includes(query) ||
      ev.date?.toLowerCase().includes(query) ||
      ev.location?.toLowerCase().includes(query);

   

    // Skill Level
    const matchesLevel =
      !selectedLevel ||
      selectedLevel === 'All Levels' ||
      (ev.level || '').toLowerCase().includes(selectedLevel.toLowerCase());

    // Pass Fee
    const price = Number(String(ev.prize || '').replace(/[^\d]/g, '')) || 0;

    const matchesPrice =
      !priceFilter ||
      (priceFilter === 'under-1000' && price <= 1000) ||
      (priceFilter === 'above-1000' && price > 1000);

    return (
      matchesSearch &&
      matchesLevel &&
      matchesPrice
    );
  });

  // Sort Results
  filtered.sort((a, b) => {
    if (sortBy === 'slots-low') {
      return (Number(a.slots) || 0) - (Number(b.slots) || 0);
    }

    const priceA = Number(String(a.prize || '').replace(/[^\d]/g, '')) || 0;
    const priceB = Number(String(b.prize || '').replace(/[^\d]/g, '')) || 0;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;

    const dateA = new Date(a.date || '').getTime() || Infinity;
    const dateB = new Date(b.date || '').getTime() || Infinity;

    return dateA - dateB;
  });

  return filtered;
}, [
  events,
  searchQuery,
  selectedLevel,
  priceFilter,
  sortBy,
]);

const hasActiveFilters =
  searchQuery || selectedLevel || priceFilter;

const resetAllFilters = () => {
  setSearchQuery('');
  setSelectedLevel('');
  setPriceFilter('');
  setSortBy('soonest');
};

const handleOpenWorkshop = (ev) => {
  setSelectedWorkshop(ev);
  setReserveSuccess(false);
  setIsBookingModalOpen(false);
  navigate(`/workshop/${ev._id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleCloseWorkshop = () => {
  setSelectedWorkshop(null);
  setReserveSuccess(false);
  setIsBookingModalOpen(false);
  navigate('/');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  `*PASS CODE:* ${genId}\n` +
  `*WORKSHOP:* ${selectedWorkshop?.title}\n` +
  `*DANCER NAME:* ${reserveForm.name}\n` +
  `*WHATSAPP:* ${reserveForm.phone}\n` +
  `*EMAIL:* ${reserveForm.email || 'N/A'}\n` +
  `*PASSES RESERVED:* ${reserveForm.slots}\n` +
  `*DATE:* ${selectedWorkshop?.date || 'Scheduled Soon'}\n` +
  `*LOCATION:* ${selectedWorkshop?.location || 'Valasaravakkam Studio, Chennai'}\n\n` +
  `Please confirm my admission and share UPI / Payment details. Thank you!`;

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="app brand-theme-active">
      {/* FLOATING QUICK WHATSAPP CHAT BUTTON */}
      <a
        href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20Rhythmic%20Beat%20Dance%20Court!%20I%20have%20an%20enquiry.`}
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp-widget"
        aria-label="Chat with Studio on WhatsApp"
      >
        <span className="wa-icon"><MessageCircle size={22} /></span>
        <span className="wa-text">Chat on WhatsApp</span>
      </a>

      {/* NAVBAR (Admin button removed as requested) */}
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
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
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
            <MessageCircle size={18} /> WhatsApp Enquire
          </a>
        </nav>
      </header>

      <main>
        {/* BANNER / HERO SECTION (Modern Light Aesthetic, No Black Background, Right Side Spotlight Pass) */}
        {!selectedWorkshop && !workshopId && (
          <section className="rb-hero-modern" id="home">
            <div className="rb-hero-backdrop-glow" aria-hidden="true" />
            <div className="rb-hero-container">
              {/* LEFT COLUMN: HERO CONTENT */}
              <div className="rb-hero-text-col">
                <div className="rb-hero-pill-badge">
                  <span className="badge-dot">●</span>
                  <span>THE STAGE IS YOURS • CHENNAI</span>
                </div>

                <h1 className="rb-hero-heading">
                  FEEL THE <span className="highlight-beat">BEAT.</span>
                  <br />
                  OWN THE STAGE.
                </h1>

                <p className="rb-hero-subtext">
                  Welcome to Rhythmic Beat Dance Court. Experience masterclass choreography,
                  high-energy workshops, and professional stage training led by industry-leading dancers.
                </p>

                <div className="rb-hero-cta-group">
                  <a className="hero-btn-primary" href="#workshops">
                    EXPLORE WORKSHOPS <ArrowRight size={18} />
                  </a>
                  <a
                    className="hero-btn-secondary"
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20Rhythmic%20Beat!%20I%20want%20to%20join%20regular%20dance%20batch.`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    JOIN REGULAR BATCH ↗
                  </a>
                </div>

                {/* STATS ROW (FROM SCREENSHOT 2) */}
                <div className="rb-hero-stats-row">
                  <div className="stat-item">
                    <strong>1,500+</strong>
                    <span>DANCERS TRAINED</span>
                  </div>
                  <div className="stat-separator" />
                  <div className="stat-item">
                    <strong>3</strong>
                    <span>CHENNAI STUDIOS</span>
                  </div>
                  <div className="stat-separator" />
                  <div className="stat-item">
                    <strong>50+</strong>
                    <span>WORKSHOPS CONDUCTED</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: MODERN SPOTLIGHT WORKSHOP CARD (FIXES EMPTY RIGHT SIDE) */}
              <div className="rb-hero-showcase-col">
                {events[0] ? (
                  <div className="hero-spotlight-card">
                    <div className="spotlight-card-top">
                      <span className="spotlight-pulse-chip">
                        <span className="pulse-ping" />
                        FEATURED MASTERCLASS
                      </span>
                      <span className="spotlight-level-chip">
                        <Target size={14} /> {events[0].level || 'Open Level'}
                      </span>
                    </div>

                    <div className="spotlight-media-frame">
                      {assetUrl(events[0].image) && !failedImages[events[0]._id] ? (
                        <img
                          src={assetUrl(events[0].image)}
                          alt={events[0].title}
                          className="spotlight-poster-img"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [events[0]._id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="spotlight-poster-placeholder">
                          <Zap size={32} />
                          <strong>RHYTHMIC BEAT</strong>
                          <small>MASTERCLASS ARENA</small>
                        </div>
                      )}
                      <div className="spotlight-fee-overlay">
                        <span>PASS FEE</span>
                        <strong>{events[0].prize || '₹1,000'}</strong>
                      </div>
                    </div>

                    <div className="spotlight-body">
                      <h3 className="spotlight-title">{events[0].title}</h3>

                      <div className="spotlight-track-pill">
                        <Music2 size={16} />
                        <span>Track: {formatSongName(events[0].song)}</span>
                      </div>

                      <div className="spotlight-specs-compact">
                        <div className="spec-compact-item">
                          <CalendarDays size={15} />
                          <span>{events[0].date || 'Upcoming'}</span>
                        </div>
                        <div className="spec-compact-item">
                          <Clock size={15} />
                          <span>{events[0].time || 'TBA'}</span>
                        </div>
                        <div className="spec-compact-item full">
                          <MapPin size={15} />
                          <span>{events[0].location || 'Valasaravakkam Studio, Chennai'}</span>
                        </div>
                      </div>

                      {/* Capacity / Slots Remaining bar */}
                      <div className="spotlight-slots-meter">
                        <div className="meter-header">
                          <small>AVAILABILITY</small>
                          <strong>
                            {events[0].slots > 0
                              ? `Only ${events[0].slots} Slots Remaining`
                              : 'Registration Open'}
                          </strong>
                        </div>
                        <div className="meter-track">
                          <div
                            className="meter-fill"
                            style={{
                              width: `${Math.max(
                                15,
                                Math.min(100, ((20 - (events[0].slots || 10)) / 20) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="spotlight-reserve-btn"
                        onClick={() => handleOpenWorkshop(events[0])}
                      >
                        RESERVE ADMISSION PASS <Ticket size={17} />
                      </button>
                    </div>

                    {/* Floating Badges */}
                    <div className="spotlight-floating-badge badge-top">
                      <Sparkles size={15} /> 4.9★ Dancer Rating
                    </div>
                    <div className="spotlight-floating-badge badge-bottom">
                      <Video size={15} /> 4K Cinematic Reel Included
                    </div>
                  </div>
                ) : (
                  <div className="hero-spotlight-fallback">
                    <div className="fallback-icon-ring">
                      <Zap size={36} />
                    </div>
                    <h3>Intensive Dance Masterclasses</h3>
                    <p>Learn choreographies from industry masters across Hip-Hop, Folk, Kuthu & Contemporary.</p>
                    <a href="#workshops" className="fallback-btn">Explore Sessions ↓</a>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* WORKSHOPS & MASTERCLASSES SECTION */}
        <section className="workshops-section" id="workshops">
          <div className="section-header-box">
            <span className="section-kicker">FEATURED SESSIONS</span>
            <h2>
              THE <span>WORKSHOPS.</span>
            </h2>
            <p className="section-subtitle">
              Browse upcoming masterclasses, select your favorite style or branch, and reserve your admission pass directly.
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
               WORKSHOP DETAIL VIEW (REDESIGNED MATCHING SCREENSHOT 1 & 2-COLUMN PASS)
               ========================================= */
            <div className="premium-detail-container">
              <div className="detail-top-nav">
                <button
                  type="button"
                  className="premium-back-btn"
                  onClick={handleCloseWorkshop}
                >
                  ← Back to All Workshops
                </button>

                <div className="detail-header-badges">
                  <span className="detail-status-pill">
                    ● {selectedWorkshop.status || 'OPEN FOR BOOKING'}
                  </span>
                  <span className="detail-branch-pill">
                    <MapPin size={16} />
                    {selectedWorkshop.location || 'Valasaravakkam Studio, Chennai'}
                  </span>
                </div>
              </div>

              <div className="detail-columns-layout">
                {/* LEFT COLUMN: WORKSHOP MEDIA, TITLE, SPECS & CURRICULUM */}
                <div className="detail-left-content">
                  {/* MAIN POSTER / IMAGE */}
                  <div className="detail-poster-wrapper">
                    {assetUrl(selectedWorkshop.image) && !failedImages[selectedWorkshop._id] ? (
                      <div className="poster-frame-clean">
                        <img
                          src={assetUrl(selectedWorkshop.image)}
                          alt={selectedWorkshop.title}
                          className="poster-img-clean"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [selectedWorkshop._id]: true,
                            }))
                          }
                        />
                        <div className="poster-badge-floating">
                          <Ticket size={15} /> OFFICIAL WORKSHOP PASS
                        </div>
                      </div>
                    ) : (
                      <div className="poster-placeholder-clean">
                        <Zap size={32} />
                        <strong>RHYTHMIC BEAT</strong>
                        <small>DANCE COURT</small>
                      </div>
                    )}
                  </div>

                  {/* TITLE & TAGS */}
                  <div className="detail-title-section">
                    <div className="detail-tags-row">
                      <span className="tag-pill genre">
                        <Zap size={14} />
                        {selectedWorkshop.title.toLowerCase().includes('kuthu')
                          ? 'FOLK & KUTHU'
                          : selectedWorkshop.title.toLowerCase().includes('contemporary')
                          ? 'CONTEMPORARY'
                          : selectedWorkshop.title.toLowerCase().includes('battle')
                          ? 'DANCE BATTLE'
                          : 'CHOREOGRAPHY MASTERCLASS'}
                      </span>
                      <span className="tag-pill level">
                        <Target size={14} />
                        {selectedWorkshop.level || 'Beginner & Intermediate Friendly'}
                      </span>
                    </div>

                    <h1 className="detail-main-title">{selectedWorkshop.title}</h1>
                  </div>

                  {/* SPECS GRID WITH CRISP LUCIDE ICONS (NO PLACEHOLDER SVG IMAGES) */}
                  <div className="detail-specs-grid">
                    <div className="spec-card-modern">
                      <div className="spec-icon-box calendar">
                        <CalendarDays size={20} />
                      </div>
                      <div>
                        <small>EVENT DATE</small>
                        <strong>{selectedWorkshop.date || 'Scheduled Soon'}</strong>
                      </div>
                    </div>

                    <div className="spec-card-modern">
                      <div className="spec-icon-box clock">
                        <Clock size={20} />
                      </div>
                      <div>
                        <small>WORKSHOP TIME</small>
                        <strong>{selectedWorkshop.time || 'Schedule TBA'}</strong>
                      </div>
                    </div>

                    <div className="spec-card-modern">
                      <div className="spec-icon-box venue">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <small>STUDIO VENUE</small>
                        <strong>{selectedWorkshop.location || 'Valasaravakkam Studio, Chennai'}</strong>
                      </div>
                    </div>

                    <div className="spec-card-modern">
                      <div className="spec-icon-box slots">
                        <Zap size={20} />
                      </div>
                      <div>
                        <small>AVAILABLE SLOTS</small>
                        <strong className="slots-alert-text">
                          {selectedWorkshop.slots > 0
                            ? `${selectedWorkshop.slots} Slots Left`
                            : 'Open Registration'}
                        </strong>
                      </div>
                    </div>

                    <div className="spec-card-modern">
                      <div className="spec-icon-box duration">
                        <Timer size={20} />
                      </div>
                      <div>
                        <small>DURATION</small>
                        <strong>{selectedWorkshop.duration || '2.5 Hours Masterclass'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* OFFICIAL WORKSHOP TRACK */}
                  <div className="detail-track-card">
                    <div className="track-icon-box">
                      <Music2 size={24} />
                    </div>
                    <div className="track-info">
                      <small>OFFICIAL WORKSHOP TRACK</small>
                      <strong>{formatSongName(selectedWorkshop.song)}</strong>
                      <p>Learn authentic musicality, beat pockets, and speed variations.</p>
                    </div>
                  </div>

                  {/* LEAD FACULTY */}
                  <div className="detail-mentor-card">
                    <div className="mentor-icon-box">
                      <UsersRound size={24} />
                    </div>
                    <div className="mentor-info">
                      <small>LEAD FACULTY & CHOREOGRAPHER</small>
                      <strong>
                        {selectedWorkshop.instructor || 'Master Choreographer Rahul & RB Crew'}
                      </strong>
                    </div>
                  </div>

                  {/* ABOUT THE WORKSHOP */}
                  <div className="detail-info-block">
                    <h3>About The Workshop</h3>
                    <p>
                      {selectedWorkshop.description ||
                        'Get ready to learn an explosive choreography piece with master techniques, musicality nuances, dynamic body control, and confidence on stage.'}
                    </p>
                  </div>

                  {/* WHAT HAPPENS IN THIS WORKSHOP (SESSION CURRICULUM FLOW) */}
                  {selectedWorkshop.agenda?.trim() && (
                    <div className="detail-agenda-block">
                      <div className="agenda-title-wrap">
                        <span className="agenda-subtag">SESSION FLOW & CURRICULUM</span>
                        <h3>What Happens in This Workshop</h3>
                      </div>
                      <div className="agenda-timeline-cards">
                        {selectedWorkshop.agenda
                          .split('\n')
                          .filter((l) => l.trim())
                          .map((line, idx) => (
                            <div key={idx} className="timeline-step-card">
                              <div className="step-badge">
                                <span>Phase 0{idx + 1}</span>
                              </div>
                              <p className="step-text">{line}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* PASS INCLUSIONS & PERKS */}
                  <div className="detail-inclusions-card">
                    <h3>Pass Inclusions & Perks</h3>
                    <ul className="inclusions-icon-list">
                      <li>
                        <Video size={18} className="inc-icon video" />
                        <div>
                          <strong>4K Cinematic Stage Video Shoot</strong>
                          <span>Professionally captured stage lighting reel for your portfolio & Instagram.</span>
                        </div>
                      </li>
                      <li>
                        <Trophy size={18} className="inc-icon trophy" />
                        <div>
                          <strong>Verified Studio Certificate</strong>
                          <span>Official certification of completion signed by master choreographers.</span>
                        </div>
                      </li>
                      <li>
                        <Headphones size={18} className="inc-icon audio" />
                        <div>
                          <strong>High-Quality Practice Audio Track</strong>
                          <span>Direct access to speed-controlled choreography audio cuts.</span>
                        </div>
                      </li>
                      <li>
                        <Droplets size={18} className="inc-icon floor" />
                        <div>
                          <strong>Air-Conditioned Sprung Wooden Floor</strong>
                          <span>Injury-preventive studio flooring engineered for high jumps & knee work.</span>
                        </div>
                      </li>
                      <li>
                        <Camera size={18} className="inc-icon camera" />
                        <div>
                          <strong>High-Resolution Photo Session</strong>
                          <span>Solo stage poses and mentor group photos delivered after session.</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* DRESS CODE & GUIDELINES */}
                  <div className="detail-info-block">
                    <h3>Dress Code & Guidelines</h3>
                    <p>
                      {selectedWorkshop.requirements ||
                        'Wear comfortable dancewear or athletic sweatpants and clean indoor dance sneakers. Please bring your personal water bottle and sweat towel.'}
                    </p>
                  </div>

                  {/* EXTRA DETAILS: PARTICIPANTS, GUEST, SPECIAL ACTIVITIES, HIGHLIGHTS */}
                  {(selectedWorkshop.participants?.trim() ||
                    selectedWorkshop.guestName?.trim() ||
                    selectedWorkshop.specialActivities?.trim() ||
                    selectedWorkshop.highlights?.trim()) && (
                    <div className="detail-extra-grid">
                      {selectedWorkshop.participants?.trim() && (
                        <div className="extra-info-card">
                          <h4><Users size={18} /> Who Can Participate?</h4>
                          <p>{selectedWorkshop.participants}</p>
                        </div>
                      )}
                      {selectedWorkshop.guestName?.trim() && (
                        <div className="extra-info-card">
                          <h4><Music2 size={18} /> Guest Faculty</h4>
                          <p>{selectedWorkshop.guestName}</p>
                        </div>
                      )}
                      {selectedWorkshop.specialActivities?.trim() && (
                        <div className="extra-info-card">
                          <h4><Zap size={18} /> Special Activities</h4>
                          <p>{selectedWorkshop.specialActivities}</p>
                        </div>
                      )}
                      {selectedWorkshop.highlights?.trim() && (
                        <div className="extra-info-card">
                          <h4><Trophy size={18} /> Highlights</h4>
                          <p>{selectedWorkshop.highlights}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: STICKY ADMISSION PASS CARD (EXACTLY LIKE SCREENSHOT 1) */}
                <div className="detail-sticky-pass-col">
                  <div className="admission-pass-card">
                    {/* CARD HEADER */}
                    <div className="pass-card-header">
                      <div className="pass-brand-title">
                        <span className="pass-ticket-icon">
                          <Ticket size={18} />
                        </span>
                        <div>
                          <h3>ADMISSION PASS</h3>
                          <small>RHYTHMIC BEAT</small>
                        </div>
                      </div>
                      <div className="pass-fee-badge">
                        <span className="fee-lbl">FEE</span>
                        <span className="fee-val">{selectedWorkshop.prize || '1000'}</span>
                      </div>
                    </div>

                    {/* PASSES REMAINING WARNING */}
                    <div className="pass-urgency-banner">
                      <span className="urgency-dot">●</span>
                      <span>
                        {selectedWorkshop.slots > 0
                          ? `Only ${selectedWorkshop.slots} Passes Remaining!`
                          : 'Limited Workshop Admission'}
                      </span>
                    </div>

                    {reserveSuccess ? (
                      /* BOOKED CONFIRMATION CARD */
                      <div className="pass-success-view">
                        <div className="success-badge-pill">✓ PASS SECURED</div>
                        <h4>Registration Registered!</h4>
                        <p>
                          Your Admission Pass Code is:
                          <strong className="ticket-code-highlight"> #{ticketId}</strong>
                        </p>
                        <div className="success-receipt-box">
                          <div className="receipt-row">
                            <span>WORKSHOP:</span>
                            <strong>{selectedWorkshop.title}</strong>
                          </div>
                          <div className="receipt-row">
                            <span>DANCER:</span>
                            <strong>{reserveForm.name}</strong>
                          </div>
                          <div className="receipt-row">
                            <span>PASSES:</span>
                            <strong>{reserveForm.slots} Slot(s)</strong>
                          </div>
                        </div>

                        <a
                          className="pass-confirm-wa-btn"
                          href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                            `Hi RB Dance Court! I have reserved pass #${ticketId} for ${selectedWorkshop.title}. Please confirm admission.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle size={18} /> Confirm Pass on WhatsApp
                        </a>

                        <button
                          type="button"
                          className="pass-new-booking-btn"
                          onClick={() => setReserveSuccess(false)}
                        >
                          Reserve Another Pass
                        </button>
                      </div>
                    ) : (
                      /* DIRECT RESERVATION FORM */
                      <form className="pass-claim-form" onSubmit={handleReserveSubmit}>
                        {/* PASS QUANTITY SELECTOR */}
                        <div className="pass-form-row">
                          <label className="pass-input-label">Select Quantity of Passes</label>
                          <div className="pass-count-selector">
                            {[1, 2, 3, 4].map((num) => (
                              <button
                                key={num}
                                type="button"
                                className={`pass-qty-btn ${reserveForm.slots === num ? 'active' : ''}`}
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

                        {/* NAME */}
                        <div className="pass-form-row">
                          <label htmlFor="pass-res-name" className="pass-input-label">
                            Full Name *
                          </label>
                          <input
                            id="pass-res-name"
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={reserveForm.name}
                            onChange={(e) =>
                              setReserveForm({
                                ...reserveForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* WHATSAPP */}
                        <div className="pass-form-row">
                          <label htmlFor="pass-res-phone" className="pass-input-label">
                            WhatsApp Number *
                          </label>
                          <input
                            id="pass-res-phone"
                            type="tel"
                            required
                            placeholder="e.g. 9876543210"
                            value={reserveForm.phone}
                            onChange={(e) =>
                              setReserveForm({
                                ...reserveForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>

                        {/* EMAIL */}
                        <div className="pass-form-row">
                          <label htmlFor="pass-res-email" className="pass-input-label">
                            Email (Optional)
                          </label>
                          <input
                            id="pass-res-email"
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

                        {/* SUBMIT BUTTON */}
                        <button
                          type="submit"
                          className="pass-submit-btn"
                          disabled={isSubmittingBooking}
                        >
                          {isSubmittingBooking ? (
                            'SECURING YOUR PASS...'
                          ) : (
                            <>
                              CONFIRM & CLAIM PASS <Ticket size={18} />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* ASSISTANCE FOOTER */}
                    <div className="pass-card-footer">
                      <p>Need assistance or have queries?</p>
                      <a
                        href={`https://wa.me/${WHATSAPP_PHONE}?text=Hi%20RB%20Dance%20Court%2C%20I%20have%20questions%20about%20${encodeURIComponent(
                          selectedWorkshop.title
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="pass-coordinator-link"
                      >
                        💬 Chat With Studio Coordinator
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================
               WORKSHOPS BROWSER VIEW (SPECIFIC WORKSHOP FILTERS)
               ========================================= */
            <div className="workshops-streamlined-browser">
              {/* CLEAN HORIZONTAL WORKSHOP FILTER TOOLBAR (REPLACED SIDEBAR & REMOVED BRANCH/STYLE AS REQUESTED) */}
              <div className="workshop-filter-toolbar">
                {/* Search input */}
                <div className="toolbar-search-box">
                  <span className="search-icon"><Search size={18} /></span>
                  <input
                    id="workshop-search"
                    type="text"
                    className="toolbar-search-input"
                    placeholder="Search workshop, song track, choreographer..."
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

                {/* Skill Level Pills */}
                <div className="toolbar-level-pills">
                  {SKILL_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`toolbar-pill-btn ${
                        selectedLevel === lvl || (!selectedLevel && lvl === 'All Levels')
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setSelectedLevel(lvl === 'All Levels' || selectedLevel === lvl ? '' : lvl)
                      }
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                {/* Pass Fee Range Toggle */}
                <div className="toolbar-fee-toggle">
                  {[
                    { id: 'under-1000', label: '≤ ₹1,000' },
                    { id: 'above-1000', label: '> ₹1,000' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`toolbar-fee-btn ${priceFilter === p.id ? 'active' : ''}`}
                      onClick={() => setPriceFilter(priceFilter === p.id ? '' : p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Sort Order Dropdown */}
                <div className="toolbar-sort-wrap">
                  <select
                    id="sort-select"
                    className="toolbar-select-input"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="soonest">Date: Upcoming First</option>
                    <option value="slots-low">Slots: Fewest Left</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                {/* Reset button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="toolbar-reset-btn"
                    onClick={resetAllFilters}
                  >
                    Reset Filters
                  </button>
                )}
              </div>

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
                      {selectedLevel && (
                        <span className="active-pill">
                          {selectedLevel}
                          <button
                            type="button"
                            onClick={() => setSelectedLevel('')}
                          >
                            ✕
                          </button>
                        </span>
                      )}
                      {priceFilter && (
                        <span className="active-pill">
                          {priceFilter === 'under-1000' ? '≤ ₹1,000' : '> ₹1,000'}
                          <button
                            type="button"
                            onClick={() => setPriceFilter('')}
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
<span className="empty-icon"><Drama size={30} /></span>
                    <h4>No Workshops Match Your Selected Filters</h4>
                    <p>
                      Try resetting your search or pick another dance style.
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
                                <span><Zap size={28} /></span>
                                <strong>RHYTHMIC BEAT</strong>
                                <small>DANCE COURT</small>
                              </div>
                            )}

                            {/* Top Style Tag */}
                            <span className="card-genre-pill">
                              <Zap size={16} /> {event.title.toLowerCase().includes('kuthu') ? 'FOLK & KUTHU' : event.title.toLowerCase().includes('contemporary') ? 'CONTEMPORARY' : event.title.toLowerCase().includes('battle') ? 'DANCE BATTLE' : 'CHOREOGRAPHY'}
                            </span>

                            {/* Slots Urgency Chip */}
                            <span
                              className={`card-urgency-badge ${
                                isFewSlots ? 'urgent' : ''
                              }`}
                            >
                              {isFewSlots ? (
  <><Flame size={15} /> ONLY {event.slots} SLOTS LEFT</>
) : event.slots > 0 ? (
  <>● {event.slots} SLOTS AVAILABLE</>
) : (
  <>● REGISTRATION OPEN</>
)}
                            </span>
                          </div>

                          {/* Card Content Body */}
                          <div className="modern-card-body">
                            <h3 className="modern-card-title">{event.title}</h3>

                            {/* Song Badge */}
                            <div className="card-song-badge">
<span className="song-icon"><Music2 size={18} /></span>  
                            <span className="song-text">
                                Track: {formatSongName(event.song)}
                              </span>
                            </div>

                            {/* Schedule & Venue Meta */}
                            <div className="card-meta-list">
                              <div className="meta-item">
<span className="meta-icon"><CalendarDays size={18} /></span>                                <span>{event.date || 'Date TBA'} {event.time ? `• ${event.time}` : ''}</span>
                              </div>
                              <div className="meta-item">
<span className="meta-icon"><MapPin size={18} /></span>                                <span>{event.location || 'Valasaravakkam Studio, Chennai'}</span>
                              </div>
                              <div className="meta-item">
<span className="meta-icon"><UserRound size={18} /></span>                                <span>{event.instructor || 'Master Choreographer'} • <span className="level-highlight">{event.level || 'Beginner Friendly'}</span></span>
                              </div>
                            </div>

                            {/* Inclusions Row */}
                           <div className="card-perks-row">
  <span className="perk-pill"><Video size={15} /> 4K Video Shoot</span>
  <span className="perk-pill"><Trophy size={15} /> Certificate</span>
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
RESERVE PASS <Ticket size={17} />          
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

{!selectedWorkshop && !workshopId && (
  <>
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
          <span className="feature-icon"><Trophy size={26} /></span>
          <h3>Celebrity & Pro Mentors</h3>
          <p>
            Learn industry choreography, musicality, and stage confidence directly from top artists.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon"><Sparkles size={26} /></span>
          <h3>Joint-Safe Wooden Floors</h3>
          <p>
            Professional cushioned sprung wooden floors designed to protect your joints during intensive routines.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon"><Flame size={26} /></span>
          <h3>Stage & Battle Exposure</h3>
          <p>
            Direct opportunities for state competitions, studio showcase video shoots, and performance battles.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon"><Handshake size={26} /></span>
          <h3>All Skill Levels Welcome</h3>
          <p>
            Whether you are stepping onto the floor for the first time or training for pro performances.
          </p>
        </div>
      </div>
    </section>
  </>
)}
   
{!selectedWorkshop && !workshopId && (
  <>
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
          </>
)}



{!selectedWorkshop && !workshopId && (
  <>
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
  </>
)}


 {!selectedWorkshop && !workshopId && (
  <>
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
  </>
)}
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
<MessageCircle size={18} /> WhatsApp
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
               <Camera size={20} /> Instagram
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

