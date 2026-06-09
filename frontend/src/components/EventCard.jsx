import { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence
} from 'framer-motion';
import { MapPin, Clock, Users, CalendarDays, ArrowUpRight, IndianRupee, X } from 'lucide-react';

const STATUS_CONFIG = {
  approved: { label: 'Approved', className: 'badge-success' },
  pending: { label: 'Pending', className: 'badge-warning' },
  rejected: { label: 'Rejected', className: 'badge-danger' },
};

export default function EventCard({ event, index = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [8, -8]);
  const rotateY = useTransform(x, [0, 1], [-8, 8]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 20 });

  const glowX = useTransform(x, [0, 1], ['-50%', '150%']);
  const glowY = useTransform(y, [0, 1], ['-50%', '150%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  const status = STATUS_CONFIG[event?.status] || STATUS_CONFIG.pending;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.7,
          delay: index * 0.08,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="perspective-1200 group cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <motion.div
          ref={cardRef}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            transformStyle: 'preserve-3d',
          }}
          whileHover={{ scale: 1.03 }}
          transition={{ scale: { type: 'spring', stiffness: 300, damping: 20 } }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] transition-shadow duration-500 group-hover:shadow-depth"
        >
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(400px circle at var(--glow-x) var(--glow-y), rgba(99,102,241,0.12), transparent 60%)',
              '--glow-x': glowX,
              '--glow-y': glowY,
            }}
          />

          <div className="relative h-48 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{
                backgroundImage: event?.banner
                  ? `url(${event.banner})`
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute top-4 right-4" style={{ transform: 'translateZ(30px)' }}>
              <span className={status.className}>{status.label}</span>
            </div>

            {event?.category && (
              <div className="absolute top-4 left-4" style={{ transform: 'translateZ(30px)' }}>
                <span className="badge bg-white/10 text-white backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {event.category}
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-5" style={{ transform: 'translateZ(20px)' }}>
              <h3 className="font-display text-xl font-bold text-white leading-tight line-clamp-2 drop-shadow-md">
                {event?.title || 'Untitled Event'}
              </h3>
            </div>

            <motion.div
              className="absolute top-16 right-4 w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
              initial={{ opacity: 0, x: 10, y: -10 }}
              whileHover={{ scale: 1.1 }}
              animate={{ opacity: 0 }}
              style={{ transform: 'translateZ(40px)' }}
            >
              <ArrowUpRight className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <div className="p-5 space-y-4" style={{ transform: 'translateZ(15px)' }}>
            {event?.description && (
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-brand-400" />
                <span>{formatDate(event?.date || event?.startDate)}</span>
              </div>
              {(event?.date || event?.startDate) && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neon-cyan" />
                  <span>{formatTime(event?.date || event?.startDate)}</span>
                </div>
              )}
              {event?.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neon-pink" />
                  <span className="truncate max-w-[120px]">{event.venue}</span>
                </div>
              )}
              {event?.registrations !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-neon-green" />
                  <span>{event.registrations} joined</span>
                </div>
              )}
              {event?.fee !== undefined && event.fee > 0 && (
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-neon-orange" />
                  <span>₹{event.fee}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {(event?.club?.[0] || 'H').toUpperCase()}
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {event?.club || 'Hindi Samiti Club'}
                </span>
              </div>
            </div>
          </div>

          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            whileHover={{
              boxShadow: '0 0 0 1px rgba(99,102,241,0.3), inset 0 0 30px rgba(99,102,241,0.05)',
            }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl z-10"
            >
              <div className="h-48 relative">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: event?.banner
                      ? `url(${event.banner})`
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-all border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>

                {event?.category && (
                  <span className="absolute top-4 left-4 badge bg-white/10 text-white backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {event.category}
                  </span>
                )}
                <h2 className="absolute bottom-6 left-6 right-6 text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                  {event?.title || 'Untitled Event'}
                </h2>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm text-[var(--text-secondary)] mb-8 p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-brand-400" />
                    <span className="font-medium">{formatDate(event?.date || event?.startDate)}</span>
                  </div>
                  {(event?.date || event?.startDate) && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-neon-cyan" />
                      <span className="font-medium">{formatTime(event?.date || event?.startDate)}</span>
                    </div>
                  )}
                  {event?.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-neon-pink" />
                      <span className="font-medium">{event.venue}</span>
                    </div>
                  )}
                </div>

                <div className="mb-10 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-lg font-semibold text-white mb-3">About this Event</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {event?.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {(event?.club?.[0] || 'H').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Organized by</p>
                      <p className="text-base font-medium text-white">
                        {event?.club || 'Hindi Samiti Club'}
                      </p>
                    </div>
                  </div>

                  <button className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-brand-500/25 active:scale-95">
                    Register Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}