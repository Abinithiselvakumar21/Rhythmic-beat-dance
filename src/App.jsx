import { useEffect, useState } from 'react';
import './App.css';
import Admin from './Admin';
import AdminDashboard from './AdminDashboard';

const API = 'http://localhost:5000/api/events';
const SERVER = 'http://localhost:5000';

function App() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch(API);
        const data = await response.json();

        if (!response.ok) {
          throw new Error('Unable to load events');
        }

        if (!Array.isArray(data)) {
          throw new Error('Invalid events response');
        }

        setEvents(data);
        setEventsError('');
      } catch {
        setEventsError(
          'Events load aagala. Please try again in a moment.'
        );
      } finally {
        setEventsLoading(false);
      }
    }

    loadEvents();
  }, []);

  const pathname =
    window.location.pathname.replace(/\/+$/, '') || '/';

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

  return (
    <div className="app">
      {/* HEADER */}
      <header className="navbar">
        <a
          href="#home"
          className="brand-logo"
          aria-label="Rhythmic Beat Dance Court home"
          onClick={closeMenu}
        >
          <img
            src="/dance-logo.png"
            alt="Rhythmic Beat Dance Court"
          />
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

        <nav
          className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}
          aria-label="Main navigation"
        >
          <a href="#home" onClick={closeMenu}>
            Home
          </a>
          <a href="#events" onClick={closeMenu}>
            Events
          </a>
          <a href="#about" onClick={closeMenu}>
            About
          </a>
          <a
            className="admin-link"
            href="/admin"
            onClick={closeMenu}
          >
            Admin Login <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">
              THE STAGE IS YOURS • 2026
            </p>

            <h1>
              FEEL THE
              <br />
              BEAT<span>.</span>
              <br />
              <span className="outline">OWN THE STAGE.</span>
            </h1>

            <p className="hero-text">
              One stage. Endless moves. Unforgettable moments.
              Discover dance battles and showcase your talent.
            </p>

            <a className="primary-btn" href="#events">
              EXPLORE EVENTS <span>↘</span>
            </a>
          </div>

          <div className="hero-bottom">
            <span>MOVE WITH PURPOSE.</span>
            <span>EST. FOR DANCERS</span>
          </div>
        </section>

        {/* EVENTS SECTION */}
        <section className="events-section" id="events">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                DON'T MISS YOUR MOMENT
              </p>
              <h2>
                THE <span>EVENTS.</span>
              </h2>
            </div>

            <p className="muted">
              Your next stage starts here.
            </p>
          </div>

          {eventsLoading ? (
            <p className="events-feedback">
              Loading dance events...
            </p>
          ) : eventsError ? (
            <div className="events-feedback">
              <p>{eventsError}</p>
              <button
                type="button"
                className="primary-btn"
                onClick={() => window.location.reload()}
              >
                TRY AGAIN ↻
              </button>
            </div>
          ) : events.length === 0 ? (
            <p className="events-feedback">
              No events available right now. Stay tuned for
              upcoming dance events!
            </p>
          ) : (
            <div className="event-grid">
              {events.map((event, index) => (
                <article
                  className="event-card"
                  key={event._id}
                >
                  {event.image ? (
                    <div className="event-art">
                      <img
                        src={`${SERVER}${event.image}`}
                        alt={event.title}
                        className="dynamic-event-image"
                      />
                      <span className="event-tag">
                        {event.status || 'UPCOMING'}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`event-art ${
                        index % 2 === 0
                          ? 'art-one'
                          : 'art-two'
                      }`}
                    >
                      <span className="event-tag">
                        {event.status || 'UPCOMING'}
                      </span>
                      <span className="art-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="art-title">
                        {event.title}
                      </span>
                    </div>
                  )}

                  <div className="event-info">
                    <p className="event-type">
                      {event.status || 'Dance Event'}
                    </p>

                    <h3>{event.title}</h3>

                    <p>
                      {event.description ||
                        'Get ready to own the stage.'}
                    </p>

                    <div className="event-meta">
                      <span>
                        Prize: {event.prize || 'To be announced'}
                      </span>
                      <span>
                        Slots: {event.slots ?? 'Open'}
                      </span>
                    </div>

                    {(event.date || event.time) && (
                      <p className="dynamic-event-date">
                        {event.date || 'Date to be announced'}
                        {event.time ? ` · ${event.time}` : ''}
                      </p>
                    )}

                    {event.song && (
                      <div className="public-event-audio">
                        <p>Listen to the event track</p>
                        <audio controls preload="none">
                          <source
                            src={`${SERVER}${event.song}`}
                          />
                          Your browser does not support audio
                          playback.
                        </audio>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ABOUT SECTION */}
        <section className="about-section" id="about">
          <p className="eyebrow">THIS IS YOUR SPACE</p>

          <h2>
            LESS TALK.
            <br />
            <span>MORE DANCE.</span>
          </h2>

          <p>
            A community built around movement, music and the
            courage to step into the spotlight.
          </p>

          <a className="about-cta" href="#events">
            FIND YOUR NEXT EVENT <span>↗</span>
          </a>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-main">
          <a
            href="#home"
            className="footer-logo"
            aria-label="Back to home"
          >
            <img
              src="/dance-logo.png"
              alt="Rhythmic Beat Dance Court"
            />
          </a>

          <p className="footer-tagline">
            LET YOUR BODY SPEAK.
            <br />
            <span>MADE FOR THE LOVE OF DANCE.</span>
          </p>

          <div className="footer-navigation">
            <p className="footer-heading">EXPLORE</p>
            <a href="#home">Home</a>
            <a href="#events">Dance Events</a>
            <a href="#about">About Us</a>
            <a href="/admin">Admin Login ↗</a>
          </div>
        </div>

       
         

          <a href="#home">
            BACK TO TOP <span>↑</span>
          </a>
        
      </footer>
    </div>
  );
}

export default App;