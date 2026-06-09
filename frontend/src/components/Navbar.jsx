import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function MagneticButton({ children, className = '', onClick, id, ariaLabel }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    x.set(distX * 0.3);
    y.set(distY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      id={id}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.9 }}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/events';
    switch (user.role) {
      case 'super_admin': return '/admin';
      case 'organizer': return '/organizer';
      case 'student': return '/student';
      default: return '/events';
    }
  };

  const navLinks = [
    { to: '/events', label: 'Events', icon: CalendarDays },
    ...(isAuthenticated
      ? [{ to: getDashboardPath(), label: 'Dashboard', icon: LayoutDashboard }]
      : []),
  ];

  const authLinks = isAuthenticated
    ? []
    : [
        { to: '/login', label: 'Sign In' },
        { to: '/register', label: 'Get Started', primary: true },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3">
        <div className="glass-card rounded-2xl px-5 py-3 flex items-center justify-between shadow-lg shadow-black/5 dark:shadow-black/30">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute inset-0 rounded-xl bg-brand-500/20 blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              <span className="text-gradient">CEMS</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.to)
                    ? 'text-brand-400'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-brand-500/10 rounded-xl border border-brand-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <MagneticButton
              id="theme-toggle-desktop"
              onClick={toggleTheme}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all duration-200"
              ariaLabel="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </MagneticButton>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <UserCircle className="w-4 h-4 text-brand-400" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">{user?.name?.split(' ')[0]}</span>
                  <span className="badge-info text-[10px] py-0.5 px-2">{user?.role?.replace('_', ' ')}</span>
                </div>
                <MagneticButton
                  id="logout-btn"
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  ariaLabel="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </MagneticButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {authLinks.map((link) =>
                  link.primary ? (
                    <Link key={link.to} to={link.to}>
                      <motion.button
                        className="btn-primary text-sm py-2.5 px-5"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {link.label}
                      </motion.button>
                    </Link>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="btn-ghost text-sm"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <MagneticButton
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)]"
              ariaLabel="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </MagneticButton>
            <MagneticButton
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)]"
              ariaLabel="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </MagneticButton>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mx-4 mt-2 overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-[var(--border)] my-2" />

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                authLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium text-center transition-all duration-200 ${
                      link.primary
                        ? 'btn-primary'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
