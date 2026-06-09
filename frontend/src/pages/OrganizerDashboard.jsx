import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  CalendarDays, Clock, MapPin, Users, Plus, CheckCircle, XCircle,
  BarChart3, AlertTriangle, ArrowUpRight, Eye, Edit3, Lock,
  Rocket, Sparkles, Inbox,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function AnimatedCounter({ value, duration = 1.5 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value, duration, ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(obj.val)),
    });
  }, [value, duration]);
  return <span>{display}</span>;
}

function EmptySection({ icon: Icon, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card p-12 text-center"
    >
      <div className="relative inline-block mb-5">
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/15 to-purple-500/15 flex items-center justify-center border border-brand-500/10"
        >
          <Icon className="w-9 h-9 text-brand-400" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-3 rounded-2xl bg-brand-500/5 blur-xl"
        />
      </div>
      <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">{subtitle}</p>
    </motion.div>
  );
}

function ConflictModal({ conflict, onClose }) {
  if (!conflict) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md glass-card-deep p-6 border-2 border-red-500/30"
          style={{ boxShadow: '0 0 60px rgba(239,68,68,0.2), 0 0 120px rgba(239,68,68,0.1)' }}
        >
          <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: '0 0 40px rgba(239,68,68,0.15)' }} />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">Venue Conflict Detected</h3>
                <p className="text-xs text-red-400">Double-booking prevention</p>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4 text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong className="text-[var(--text-primary)]">Conflict Rule:</strong></p>
              <p className="font-mono text-xs text-red-400 bg-red-500/5 p-2 rounded-lg">
                Conflict = (V₁ = V₂) ∧ (S₁ &lt; E₂) ∧ (E₁ &gt; S₂)
              </p>
              <p><strong className="text-[var(--text-primary)]">Existing Event:</strong> {conflict.existingEvent}</p>
              <p><strong className="text-[var(--text-primary)]">Venue:</strong> {conflict.venue}</p>
              <p><strong className="text-[var(--text-primary)]">Time:</strong> {conflict.time}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-danger flex-1">Understood</button>
              <button onClick={onClose} className="btn-secondary flex-1">Modify Schedule</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'events', label: 'My Events', icon: CalendarDays },
  { id: 'create', label: 'Create Event', icon: Plus },
  { id: 'registrations', label: 'Registrations', icon: Users },
];

const CATEGORIES = [
  { value: 'technical', label: 'Tech' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'social', label: 'Social' },
];

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conflict, setConflict] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', venue: '', category: 'technical',
    date: '', startTime: '', endTime: '', fee: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  const userClub = user?.club || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [evtRes, regRes] = await Promise.all([
          api.get('/events/my-events'),
          api.get('/events/my-registrations-organizer'),
        ]);
        setEvents(evtRes.data.events || evtRes.data || []);
        setRegistrations(regRes.data.registrations || regRes.data || []);
      } catch {
        setEvents([]);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userClub]);

  const stats = [
    { label: 'Total Events', value: events.length, icon: CalendarDays, color: 'from-brand-500 to-brand-600' },
    { label: 'Pending Approval', value: events.filter((e) => e.status === 'pending').length, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Registrations', value: registrations.length, icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Approved', value: events.filter((e) => e.status === 'approved').length, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
  ];

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg({ type: '', text: '' });

    try {
      const startISO = createForm.date && createForm.startTime
        ? new Date(`${createForm.date}T${createForm.startTime}:00`).toISOString()
        : '';
      const endISO = createForm.date && createForm.endTime
        ? new Date(`${createForm.date}T${createForm.endTime}:00`).toISOString()
        : '';

      const payload = {
        title: createForm.title,
        description: createForm.description,
        venue: createForm.venue,
        category: createForm.category,
        date: createForm.date,
        startTime: startISO,
        endTime: endISO,
        fee: createForm.fee ? Number(createForm.fee) : 0,
        club: userClub,
      };
      await api.post('/events', payload);
      setCreateMsg({ type: 'success', text: 'Event created! It will appear after Super Admin approval.' });
      setCreateForm({ title: '', description: '', venue: '', category: 'technical', date: '', startTime: '', endTime: '', fee: '' });
      const { data } = await api.get('/events/my-events');
      setEvents(data.events || data || []);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('conflict') || err.response?.status === 409) {
        setConflict({
          existingEvent: err.response?.data?.conflictWith?.title || 'Another Event',
          venue: createForm.venue,
          time: `${createForm.startTime} — ${createForm.endTime}`,
        });
      } else {
        setCreateMsg({ type: 'error', text: msg || 'Failed to create event.' });
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRegistrationAction = async (regId, action) => {
    try {
      await api.put(`/registrations/${regId}/${action}`);
      setRegistrations((prev) => prev.filter((r) => r._id !== regId));
    } catch {
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="glass-card rounded-2xl p-4 lg:sticky lg:top-24">
              <div className="flex items-center gap-3 p-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'O'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.name || 'Organizer'}</p>
                  <p className="text-xs text-[var(--text-muted)]">Organizer</p>
                </div>
              </div>

              {userClub && (
                <div className="mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500/10 border border-brand-500/20">
                  <Lock className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-brand-400 truncate">{userClub}</span>
                </div>
              )}

              <div className="h-px bg-[var(--border)] mb-2" />

              <nav className="space-y-1">
                {SIDEBAR_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`sidebar-link w-full ${activeTab === item.id ? 'active' : ''}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-2xl font-display font-bold mb-6">Dashboard Overview</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
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

                  <h3 className="text-lg font-display font-bold mb-4">Recent Events</h3>

                  {events.length === 0 ? (
                    <EmptySection
                      icon={Rocket}
                      title="No Events Created Yet"
                      subtitle="Create your first event from the 'Create Event' tab. It will appear here after submission."
                    />
                  ) : (
                    <div className="space-y-3">
                      {events.slice(0, 5).map((event, i) => (
                        <motion.div
                          key={event._id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          className="surface-card p-4 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-brand-400 transition-colors">{event.title}</p>
                              <p className="text-xs text-[var(--text-muted)]">{event.venue}</p>
                            </div>
                          </div>
                          <span className={
                            event.status === 'approved' ? 'badge-success' :
                            event.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                          }>
                            {event.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-2xl font-display font-bold mb-6">My Events</h2>

                  {events.length === 0 ? (
                    <EmptySection
                      icon={CalendarDays}
                      title="No Events Yet"
                      subtitle="You haven't created any events yet. Head to 'Create Event' to get started."
                    />
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {events.map((event, i) => (
                          <motion.div
                            key={event._id || i}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, padding: 0 }}
                            transition={{ duration: 0.4 }}
                            className="surface-card p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-display font-bold text-[var(--text-primary)] truncate">{event.title}</h3>
                                  <span className={
                                    event.status === 'approved' ? 'badge-success' :
                                    event.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                                  }>
                                    {event.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.date || event.startDate).toLocaleDateString('en-IN')}</span>
                                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.registrations || 0} registered</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-brand-400 hover:bg-brand-500/10 transition-all">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-brand-400 hover:bg-brand-500/10 transition-all">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'create' && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-2xl font-display font-bold mb-2">Create New Event</h2>

                  {userClub && (
                    <div className="flex items-center gap-2 mb-6 text-sm">
                      <Lock className="w-4 h-4 text-brand-400" />
                      <span className="text-[var(--text-secondary)]">
                        You are locked to creating events for <strong className="text-brand-400">{userClub}</strong> only.
                      </span>
                    </div>
                  )}

                  <div className="surface-card p-6 rounded-2xl">
                    {createMsg.text && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm ${
                          createMsg.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}
                      >
                        {createMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {createMsg.text}
                      </motion.div>
                    )}

                    <form onSubmit={handleCreateEvent} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Event Title</label>
                          <input
                            type="text" required value={createForm.title}
                            onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                            placeholder="Enter event title"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Category</label>
                          <select
                            value={createForm.category}
                            onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                            className="select-field"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Description</label>
                        <textarea
                          rows={4} required value={createForm.description}
                          onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Describe your event..."
                          className="input-field resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Venue</label>
                          <input
                            type="text" required value={createForm.venue}
                            onChange={(e) => setCreateForm((f) => ({ ...f, venue: e.target.value }))}
                            placeholder="Enter venue"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Registration Fee (₹)</label>
                          <input
                            type="number" min="0" value={createForm.fee}
                            onChange={(e) => setCreateForm((f) => ({ ...f, fee: e.target.value }))}
                            placeholder="0 for free"
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Date</label>
                          <input
                            type="date" required value={createForm.date}
                            onChange={(e) => setCreateForm((f) => ({ ...f, date: e.target.value }))}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Start Time</label>
                          <input
                            type="time" required value={createForm.startTime}
                            onChange={(e) => setCreateForm((f) => ({ ...f, startTime: e.target.value }))}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">End Time</label>
                          <input
                            type="time" required value={createForm.endTime}
                            onChange={(e) => setCreateForm((f) => ({ ...f, endTime: e.target.value }))}
                            className="input-field"
                          />
                        </div>
                      </div>

                      {userClub && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-500/5 border border-brand-500/15 text-xs text-[var(--text-secondary)]">
                          <Lock className="w-4 h-4 text-brand-400 flex-shrink-0" />
                          This event will be created under <strong className="text-brand-400">{userClub}</strong>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <motion.button
                          type="submit"
                          disabled={createLoading}
                          className="btn-primary flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {createLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Create Event
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'registrations' && (
                <motion.div
                  key="registrations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-2xl font-display font-bold mb-6">Student Registrations</h2>

                  {registrations.length === 0 ? (
                    <EmptySection
                      icon={Inbox}
                      title="No Registrations Yet"
                      subtitle="When students register for your events, their requests will appear here for you to approve or reject."
                    />
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {registrations.map((reg, i) => (
                          <motion.div
                            key={reg._id || i}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0, overflow: 'hidden' }}
                            transition={{ duration: 0.4 }}
                            className="surface-card p-5 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {(reg.studentName || 'S').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{reg.studentName || 'Student'}</p>
                                <p className="text-xs text-[var(--text-muted)] truncate">{reg.eventTitle || 'Event'} &bull; {reg.email || ''}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <motion.button
                                onClick={() => handleRegistrationAction(reg._id, 'approve')}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                whileTap={{ scale: 0.9 }}
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                onClick={() => handleRegistrationAction(reg._id, 'reject')}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"
                                whileTap={{ scale: 0.9 }}
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ConflictModal conflict={conflict} onClose={() => setConflict(null)} />
    </div>
  );
}
