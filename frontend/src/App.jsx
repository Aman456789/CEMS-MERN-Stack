import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import EventFeed from './pages/EventFeed';
import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.99 },
};

const pageTransition = {
  duration: 0.45,
  ease: [0.16, 1, 0.3, 1],
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-[3px] border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-brand-500/10 blur-xl animate-pulse" />
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/events" replace />;
  }

  return children;
}

const AUTH_PATHS = ['/login', '/register', '/verify-email'];

export default function App() {
  const location = useLocation();
  const hideNavbar = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] noise-bg">
      {!hideNavbar && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/login"
            element={<PageWrapper><Login /></PageWrapper>}
          />
          <Route
            path="/register"
            element={<PageWrapper><Register /></PageWrapper>}
          />
          <Route
            path="/verify-email"
            element={<PageWrapper><VerifyEmail /></PageWrapper>}
          />
          <Route
            path="/events"
            element={<PageWrapper><EventFeed /></PageWrapper>}
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageWrapper><StudentDashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <PageWrapper><OrganizerDashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <PageWrapper><AdminDashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
