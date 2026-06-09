import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Zap, AlertCircle, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10], rotate: [0, 180, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl"
      />
      <motion.div
        animate={{ y: [20, -30, 20], x: [15, -15, 15] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl"
      />
      <motion.div
        animate={{ y: [10, -20, 10], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 right-20 w-20 h-20 border border-white/10 rounded-2xl"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-32 left-16 w-16 h-16 border border-white/10 rounded-full"
      />
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loginMode, setLoginMode] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const identifierRef = useRef(null);

  useEffect(() => {
    identifierRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await login(form.identifier, form.password);
      switch (user.role) {
        case 'super_admin': navigate('/admin'); break;
        case 'organizer': navigate('/organizer'); break;
        default: navigate('/student'); break;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-surface-dark via-brand-950 to-surface-darker items-center justify-center overflow-hidden">
        <FloatingShapes />

        <div className="relative z-10 px-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-glow-lg">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-display font-extrabold text-white mb-4"
          >
            Welcome<br />
            <span className="text-gradient">Back</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-slate-400 max-w-sm mx-auto leading-relaxed"
          >
            Sign in to manage events, track registrations, and make your campus life extraordinary.
          </motion.p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--bg-primary)]">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-gradient">CEMS</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
            Sign In
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Enter your credentials to access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">Sign in with</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.button
                  type="button"
                  onClick={() => setLoginMode('email')}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    loginMode === 'email'
                      ? 'border-brand-400 bg-brand-500/10 text-brand-400 shadow-glow-sm'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-4 h-4" />
                  Email Address
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setLoginMode('enrollment')}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    loginMode === 'enrollment'
                      ? 'border-brand-400 bg-brand-500/10 text-brand-400 shadow-glow-sm'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <Hash className="w-4 h-4" />
                  Enrollment No.
                </motion.button>
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="login-identifier" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
                {loginMode === 'email' ? 'Email Address' : 'Enrollment No.'}
              </label>
              <div className="relative">
                {loginMode === 'email' ? (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-brand-400 transition-colors" />
                ) : (
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-brand-400 transition-colors" />
                )}
                <input
                  ref={identifierRef}
                  id="login-identifier"
                  name="identifier"
                  type={loginMode === 'email' ? 'email' : 'text'}
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder={loginMode === 'email' ? 'student@university.edu' : 'Enrollment No.'}
                  className="input-field pl-11"
                  autoComplete={loginMode === 'email' ? 'email' : 'username'}
                />
              </div>
            </div>

            <div className="relative group">
              <label htmlFor="login-password" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-field pl-11 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
