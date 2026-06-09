import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  CalendarDays, Clock, MapPin, CheckCircle,
  Ticket, Star, BookOpen, ArrowUpRight, IndianRupee,
  Compass, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function AnimatedCounter({ value, duration = 1.5 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(obj.val)),
    });
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}

function EmptyEvents() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="surface-card p-12 text-center"
    >
      <div className="relative inline-block mb-6">
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500/15 to-purple-500/15 flex items-center justify-center border border-brand-500/10"
        >
          <Compass className="w-10 h-10 text-brand-400" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-3 rounded-3xl bg-brand-500/5 blur-xl"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center shadow-neon"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </motion.div>
      </div>
      <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">
        No Events Yet
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
        You haven&apos;t registered for any events yet. Head over to the Event Feed to discover and join exciting campus events!
      </p>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/events/my-registrations');
        setRegisteredEvents(data.events || data || []);
      } catch {
        setRegisteredEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Registered Events', value: registeredEvents.length, icon: Ticket, color: 'from-brand-500 to-brand-600' },
    { label: 'Upcoming', value: registeredEvents.filter((e) => new Date(e.date || e.startDate) > new Date()).length, icon: Clock, color: 'from-purple-500 to-purple-600' },
    { label: 'Attended', value: registeredEvents.filter((e) => e.attended).length, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Certificates', value: registeredEvents.filter((e) => e.certificate).length, icon: Star, color: 'from-amber-500 to-amber-600' },
  ];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBA';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-2">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Student'}</span>
          </h1>
          <p className="text-[var(--text-secondary)]">Here&apos;s a summary of your event activity</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="metric-card group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-3xl font-display font-bold text-[var(--text-primary)] mb-1">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">My Events</h2>
            <span className="text-sm text-[var(--text-muted)]">{registeredEvents.length} total</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="surface-card p-5 animate-pulse flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[var(--bg-elevated)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--bg-elevated)] rounded w-1/3" />
                    <div className="h-3 bg-[var(--bg-elevated)] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : registeredEvents.length === 0 ? (
            <EmptyEvents />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {registeredEvents.map((event, i) => {
                  const isPast = new Date(event.date || event.startDate) < new Date();
                  return (
                    <motion.div
                      key={event._id || i}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="surface-card p-5 flex items-center gap-5 group"
                    >
                      <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white font-display font-bold ${
                        isPast
                          ? 'bg-gradient-to-br from-gray-500 to-gray-600'
                          : 'bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow-sm'
                      }`}>
                        <span className="text-xs font-body opacity-80">
                          {new Date(event.date || event.startDate).toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                        <span className="text-xl leading-none">
                          {new Date(event.date || event.startDate).getDate()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-[var(--text-primary)] truncate group-hover:text-brand-400 transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-[var(--text-muted)]">
                          {event.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {event.venue}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(event.date || event.startDate)}
                          </span>
                          {event.fee > 0 && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" /> ₹{event.fee}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        {isPast ? (
                          <span className="badge bg-gray-500/10 text-gray-400 border border-gray-500/20">Completed</span>
                        ) : (
                          <span className="badge-success">Upcoming</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
