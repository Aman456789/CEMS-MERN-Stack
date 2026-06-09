import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, CalendarDays, SlidersHorizontal, X, Sparkles, Rocket } from 'lucide-react';
import EventCard from '../components/EventCard';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ['All', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Social'];

function EmptyState({ search }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-24 px-6"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center border border-brand-500/10"
        >
          <Rocket className="w-12 h-12 text-brand-400" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-4 rounded-3xl bg-brand-500/10 blur-2xl"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center shadow-neon"
        >
          <Sparkles className="w-4 h-4 text-white" />
        </motion.div>
      </div>

      <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3 text-center">
        {search ? 'No Matching Events' : 'No Events Yet'}
      </h3>
      <p className="text-[var(--text-secondary)] text-center max-w-sm leading-relaxed mb-2">
        {search
          ? `We couldn\u2019t find any events matching \u201C${search}\u201D. Try adjusting your search or browse all categories.`
          : 'The event feed is waiting for its first spark. When organizers create and publish events, they\u2019ll appear here in real time.'}
      </p>
      {!search && (
        <p className="text-xs text-[var(--text-muted)] text-center max-w-xs">
          Check back soon or register as an organizer to create the first event!
        </p>
      )}
    </motion.div>
  );
}

export default function EventFeed() {
  const { user } = useAuth();
  const [registeringId, setRegisteringId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/events');
        setEvents(data.events || data || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    setRegisteringId(eventId);
    try {
      const response = await api.post(`/events/${eventId}/register`);
      alert(response.data.message || 'Successfully registered for the event!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to register');
    } finally {
      setRegisteringId(null);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const blobs = [blob1Ref.current, blob2Ref.current, blob3Ref.current].filter(Boolean);
    if (blobs.length === 0) return;

    const ctx = gsap.context(() => {
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          y: () => (i % 2 === 0 ? -120 : 120),
          x: () => (i === 1 ? 60 : -40),
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5 + i * 0.5,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !search ||
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.venue?.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'All' || event.category?.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-16 relative overflow-hidden">
      <div
        ref={blob1Ref}
        className="parallax-blob w-[500px] h-[500px] bg-brand-500/[0.06] top-[10%] left-[-10%]"
      />
      <div
        ref={blob2Ref}
        className="parallax-blob w-[600px] h-[600px] bg-purple-500/[0.05] top-[40%] right-[-15%]"
      />
      <div
        ref={blob3Ref}
        className="parallax-blob w-[400px] h-[400px] bg-cyan-500/[0.04] bottom-[10%] left-[20%]"
      />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-glow-md"
            >
              <CalendarDays className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4">
              Discover <span className="text-gradient">Campus Events</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Explore upcoming events, workshops, and activities. Find what excites you and register instantly.
            </p>
          </motion.div>
        </div>

        <div className="sticky top-20 z-30 mb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="glass-card rounded-2xl p-4 shadow-lg"
            >
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="event-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events, venues, keywords..."
                    className="input-field pl-11 py-3"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--border)] flex items-center justify-center hover:bg-brand-500/20 transition-colors"
                    >
                      <X className="w-3 h-3 text-[var(--text-muted)]" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden btn-secondary flex items-center justify-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                <div className="hidden md:flex items-center gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
                        category === cat
                          ? 'bg-brand-500 text-white shadow-glow-sm'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 flex-wrap mt-4 md:hidden"
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setShowFilters(false); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        category === cat
                          ? 'bg-brand-500 text-white'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden animate-pulse">
                  <div className="h-48 bg-[var(--bg-elevated)]" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-[var(--bg-elevated)] rounded w-3/4" />
                    <div className="h-4 bg-[var(--bg-elevated)] rounded w-full" />
                    <div className="h-4 bg-[var(--bg-elevated)] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <div key={event._id || index} className="event-card-wrapper flex flex-col gap-3">
                  <EventCard event={event} index={index} />
                  {user?.role === 'student' && (
                    <button 
                      onClick={() => handleRegister(event._id)}
                      disabled={registeringId === event._id}
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-glow-sm"
                    >
                      {registeringId === event._id ? 'Registering...' : 'Register for Event'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && filteredEvents.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-[var(--text-muted)] mt-10"
            >
              Showing {filteredEvents.length} of {events.length} events
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
