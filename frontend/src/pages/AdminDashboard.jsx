import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  CalendarDays, Clock, Users, Shield, CheckCircle, XCircle,
  BarChart3, AlertTriangle, ArrowUpRight, TrendingUp, Activity,
  Search, UserCheck, Rocket, Inbox, Sparkles,
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">Venue Conflict Detected</h3>
              <p className="text-xs text-red-400">Cannot approve — double booking</p>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4 text-sm text-[var(--text-secondary)] space-y-2">
            <p className="font-mono text-xs text-red-400 bg-red-500/5 p-2 rounded-lg">
              Conflict = (V₁ = V₂) ∧ (S₁ &lt; E₂) ∧ (E₁ &gt; S₂)
            </p>
            <p><strong className="text-[var(--text-primary)]">This event:</strong> {conflict.eventTitle}</p>
            <p><strong className="text-[var(--text-primary)]">Conflicts with:</strong> {conflict.existingEvent}</p>
            <p><strong className="text-[var(--text-primary)]">Venue:</strong> {conflict.venue}</p>
          </div>

          <button onClick={onClose} className="btn-danger w-full">Understood</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'pending', label: 'Pending Events', icon: Clock },
  { id: 'all', label: 'All Events', icon: CalendarDays },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'organizers', label: 'Organizer Approvals', icon: UserCheck },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conflict, setConflict] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingOrganizers, setPendingOrganizers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [evtRes, usrRes, orgRes] = await Promise.all([
          api.get('/events'),
          api.get('/auth/users'),
          api.get('/admin/pending-organizers'),
        ]);
        setEvents(evtRes.data.events || evtRes.data || []);
        setUsers(usrRes.data.users || usrRes.data || []);
        setPendingOrganizers(orgRes.data.organizers || []);
      } catch {
        setEvents([]);
        setUsers([]);
        setPendingOrganizers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingEvents = events.filter((e) => e.status === 'pending');
  const approvedEvents = events.filter((e) => e.status === 'approved');

  const stats = [
    { label: 'Total Events', value: events.length, icon: CalendarDays, color: 'from-brand-500 to-brand-600' },
    { label: 'Pending Approval', value: pendingEvents.length, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Approved Events', value: approvedEvents.length, icon: Activity, color: 'from-emerald-500 to-emerald-600' },
  ];

  const handleEventAction = async (eventId, action) => {
    try {
      await api.patch(`/events/${eventId}/${action}`);
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId ? { ...e, status: action === 'approve' ? 'approved' : 'rejected' } : e
        )
      );
    } catch (err) {
      if (err.response?.status === 409) {
        const evt = events.find((e) => e._id === eventId);
        setConflict({
          eventTitle: evt?.title || 'This Event',
          existingEvent: err.response?.data?.conflictWith?.title || 'Another Event',
          venue: evt?.venue || 'Unknown',
        });
      }
    }
  };

  const handleOrganizerApproval = async (userId, action) => {
    try {
      if (action === 'approve') {
        await api.put(`/admin/approve-organizer/${userId}`);
      } else {
        await api.delete(`/admin/reject-organizer/${userId}`);
      }
      setPendingOrganizers((prev) => prev.filter((u) => u._id !== userId));
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isApproved: action === 'approve', isVerified: action === 'approve' ? true : u.isVerified } : u
        )
      );
    } catch {
    }
  };

  const filterEvents = (list) =>
    list.filter(
      (e) =>
        !searchQuery ||
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.organizerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="glass-card rounded-2xl p-4 lg:sticky lg:top-24">
              <div className="flex items-center gap-3 p-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.name || 'Super Admin'}</p>
                  <p className="text-xs text-red-400 font-medium">Super Admin</p>
                </div>
              </div>
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
                    {item.id === 'pending' && pendingEvents.length > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                        {pendingEvents.length}
                      </span>
                    )}
                    {item.id === 'organizers' && pendingOrganizers.length > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                        {pendingOrganizers.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-2xl font-display font-bold mb-6">Admin Command Center</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {stats.map((stat, i) => (
                      <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="metric-card group">
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

                  <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" /> Requiring Attention
                  </h3>

                  {pendingEvents.length === 0 && pendingOrganizers.length === 0 ? (
                    <EmptySection
                      icon={CheckCircle}
                      title="All Clear!"
                      subtitle="No pending items require your attention. All events and organizer registrations are up to date."
                    />
                  ) : (
                    <div className="space-y-3">
                      {pendingEvents.slice(0, 5).map((event, i) => (
                        <motion.div
                          key={event._id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.08 }}
                          className="surface-card p-4 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{event.title}</p>
                            <p className="text-xs text-[var(--text-muted)]">{event.organizerName || 'Organizer'} &bull; {event.venue}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => handleEventAction(event._id, 'approve')}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-all"
                              whileTap={{ scale: 0.9 }}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleEventAction(event._id, 'reject')}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"
                              whileTap={{ scale: 0.9 }}
                            >
                              <XCircle className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'pending' && (
                <motion.div key="pending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-2xl font-display font-bold mb-6">Pending Approvals</h2>

                  {pendingEvents.length === 0 ? (
                    <EmptySection
                      icon={CheckCircle}
                      title="All Clear!"
                      subtitle="No events are pending approval. All submissions have been reviewed."
                    />
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {pendingEvents.map((event, i) => (
                          <motion.div
                            key={event._id || i}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0, overflow: 'hidden' }}
                            transition={{ duration: 0.4 }}
                            className="surface-card p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-display font-bold text-[var(--text-primary)] mb-2">{event.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{event.description}</p>
                                <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.organizerName || 'Organizer'}</span>
                                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(event.date || event.startDate).toLocaleDateString('en-IN')}</span>
                                  <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {event.venue}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <motion.button
                                  onClick={() => handleEventAction(event._id, 'approve')}
                                  className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <CheckCircle className="w-4 h-4" /> Approve
                                </motion.button>
                                <motion.button
                                  onClick={() => handleEventAction(event._id, 'reject')}
                                  className="btn-danger py-2 px-4 text-sm flex items-center gap-1.5"
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <XCircle className="w-4 h-4" /> Reject
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'all' && (
                <motion.div key="all" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold">All Events</h2>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        type="text" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search events..."
                        className="input-field pl-10 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  {events.length === 0 ? (
                    <EmptySection
                      icon={CalendarDays}
                      title="No Events Yet"
                      subtitle="When organizers create events, they will appear here for management."
                    />
                  ) : (
                    <div className="surface-card rounded-2xl overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        <div className="col-span-4">Event</div>
                        <div className="col-span-2">Organizer</div>
                        <div className="col-span-2">Venue</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Status</div>
                      </div>

                      <AnimatePresence>
                        {filterEvents(events).map((event, i) => (
                          <motion.div
                            key={event._id || i}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                            className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
                          >
                            <div className="col-span-4 font-medium text-sm text-[var(--text-primary)] truncate">{event.title}</div>
                            <div className="col-span-2 text-sm text-[var(--text-secondary)] truncate">{event.organizerName || '—'}</div>
                            <div className="col-span-2 text-sm text-[var(--text-muted)] truncate">{event.venue}</div>
                            <div className="col-span-2 text-sm text-[var(--text-muted)]">{new Date(event.date || event.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                            <div className="col-span-2">
                              <span className={
                                event.status === 'approved' ? 'badge-success' :
                                event.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                              }>
                                {event.status}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-2xl font-display font-bold mb-6">Registered Users</h2>

                  {users.length === 0 ? (
                    <EmptySection
                      icon={Users}
                      title="No Users Yet"
                      subtitle="When students and organizers register, they will appear here."
                    />
                  ) : (
                    <div className="surface-card rounded-2xl overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        <div className="col-span-4">Name</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-2">Status</div>
                      </div>

                      {users.map((usr, i) => (
                        <motion.div
                          key={usr._id || i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
                        >
                          <div className="col-span-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(usr.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-[var(--text-primary)] truncate">{usr.name}</span>
                          </div>
                          <div className="col-span-4 text-sm text-[var(--text-muted)] truncate">{usr.email}</div>
                          <div className="col-span-2">
                            <span className={`badge ${
                              usr.role === 'super_admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              usr.role === 'organizer' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                            }`}>
                              {usr.role?.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className={usr.isVerified ? 'badge-success' : 'badge-warning'}>
                              {usr.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'organizers' && (
                <motion.div key="organizers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                  <h2 className="text-2xl font-display font-bold mb-2">Organizer Approval Queue</h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">
                    Verify organizer identities before granting access to event management.
                  </p>

                  {pendingOrganizers.length === 0 ? (
                    <EmptySection
                      icon={UserCheck}
                      title="No Pending Organizers"
                      subtitle="All organizer registrations have been reviewed. New requests will appear here automatically."
                    />
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {pendingOrganizers.map((org, i) => (
                          <motion.div
                            key={org._id || i}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.4 }}
                            className="surface-card p-5 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-brand-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {(org.name || 'O').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{org.name}</p>
                                <p className="text-xs text-[var(--text-muted)] truncate">{org.email} &bull; Club: {org.club || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <motion.button
                                onClick={() => handleOrganizerApproval(org._id, 'approve')}
                                className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
                                whileTap={{ scale: 0.95 }}
                              >
                                <CheckCircle className="w-4 h-4" /> Approve
                              </motion.button>
                              <motion.button
                                onClick={() => handleOrganizerApproval(org._id, 'reject')}
                                className="btn-danger py-2 px-4 text-sm flex items-center gap-1.5"
                                whileTap={{ scale: 0.95 }}
                              >
                                <XCircle className="w-4 h-4" /> Reject
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
