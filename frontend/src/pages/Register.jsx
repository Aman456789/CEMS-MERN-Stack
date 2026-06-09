import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight, Zap,
  AlertCircle, CheckCircle, GraduationCap, Briefcase,
  Hash, BookOpen, Building2, ShieldCheck, Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const SCHOOLS = [
  'School of Engineering & Technology',
  'School of Computer Application & Technology',
  'School of Commerce & Management',
  'School of Legal Studies & Governance',
  'School of Agricultural Sciences',
  'School of Basic & Applied Sciences',
  'School of Health & Allied Sciences',
  'School of Arts & Humanities',
  'School of Education',
];

const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const CLUBS = [
  'Dance & Dramatics Club',
  'Music Club',
  'English Debate Literary Club',
  'Ecology and Environment Club',
  'Fine Arts Club',
  'Photography Club',
  'Hindi Samiti Club',
  'Quiz Club',
  'Sports Club',
  'Entrepreneurship Development Cell',
  'Others',
];

const ROLES = [
  { value: 'student', label: 'Student', icon: GraduationCap, description: 'Discover & join events' },
  { value: 'organizer', label: 'Organizer', icon: Briefcase, description: 'Create & manage events' },
];

function PasswordStrength({ password }) {
  const checks = [
    { label: 'Min 8 characters', pass: password.length >= 8 },
    { label: '1 uppercase letter', pass: /[A-Z]/.test(password) },
    { label: '1 lowercase letter', pass: /[a-z]/.test(password) },
    { label: '1 special symbol', pass: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];

  const passCount = checks.filter((c) => c.pass).length;
  const strength = passCount === 0 ? 0 : passCount <= 2 ? 1 : passCount <= 3 ? 2 : 3;
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-amber-400', 'bg-emerald-500'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 mt-3"
    >
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i < passCount ? colors[strength] : 'bg-[var(--border)]'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">Password strength</span>
        <span className={`text-xs font-medium ${
          strength === 3 ? 'text-emerald-400' : strength >= 2 ? 'text-amber-400' : 'text-red-400'
        }`}>
          {labels[strength]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
              check.pass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[var(--border)] text-[var(--text-muted)]'
            }`}>
              {check.pass ? (
                <CheckCircle className="w-2.5 h-2.5" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </div>
            <span className={`text-[11px] ${check.pass ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OrganizerSuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center"
    >
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-amber-500/20 blur-xl animate-pulse mx-auto" />
      </div>
      <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">
        Registration Sent!
      </h2>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm mx-auto mb-6">
        Registration sent to Super Admin. You will receive an email once your identity is verified and approved.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4" />
        Identity verification pending
      </div>
      <div className="mt-8">
        <Link to="/login">
          <motion.button
            className="btn-primary inline-flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go to Login
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    enrollmentNo: '',
    program: '',
    school: '',
    semester: '',
    club: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOrganizerSuccess, setShowOrganizerSuccess] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (form.role === 'student') {
      if (!form.enrollmentNo || !form.program || !form.school || !form.semester) {
        setError('Please fill in Enrollment No., Program, School, and Semester');
        return;
      }
    }

    if (form.role === 'organizer') {
      if (!form.club) {
        setError('Please select your associated club');
        return;
      }
    }

    if (!PASSWORD_REGEX.test(form.password)) {
      setError('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 special symbol');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        fullName: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      if (form.role === 'student') {
        payload.rollNumber = form.enrollmentNo || null;
        payload.department = form.school || null;
        payload.program = form.program || null;
        payload.semester = form.semester || null;
      }

      if (form.role === 'organizer') {
        payload.club = form.club || null;
      }

      await register(payload);

      if (form.role === 'organizer') {
        setShowOrganizerSuccess(true);
      } else {
        setSuccess('Account created! Redirecting to email verification...');
        setTimeout(() => navigate('/verify-email', { state: { email: form.email } }), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showOrganizerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl"
          />
          <motion.div
            animate={{ y: [20, -20, 20] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl"
          />
        </div>
        <div className="relative glass-card-deep p-10 max-w-md w-full">
          <OrganizerSuccessScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-surface-dark via-purple-950/30 to-surface-darker items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <motion.div
            animate={{ y: [-30, 30, -30], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"
          />
          <motion.div
            animate={{ y: [20, -20, 20], x: [-20, 20, -20] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-brand-500/15 blur-3xl"
          />
        </div>

        <div className="relative z-10 px-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-brand-600 flex items-center justify-center mx-auto mb-8 shadow-glow-lg">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-display font-extrabold text-white mb-4"
          >
            Join the<br />
            <span className="text-gradient">Platform</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-slate-400 max-w-sm mx-auto leading-relaxed"
          >
            Create your account to start discovering, organizing, and managing campus events.
          </motion.p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 py-12 bg-[var(--bg-primary)] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md py-4"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-gradient">CEMS</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">
            Create Account
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Set up your profile and start exploring events
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => (
                  <motion.button
                    key={role.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                    className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
                      form.role === role.value
                        ? 'border-brand-400 bg-brand-500/10 shadow-glow-sm'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--text-muted)]'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <role.icon className={`w-5 h-5 mb-2 ${
                      form.role === role.value ? 'text-brand-400' : 'text-[var(--text-muted)]'
                    }`} />
                    <div className={`text-sm font-semibold ${
                      form.role === role.value ? 'text-brand-400' : 'text-[var(--text-primary)]'
                    }`}>
                      {role.label}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{role.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="group">
              <label htmlFor="register-name" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-brand-400 transition-colors" />
                <input
                  ref={nameRef}
                  id="register-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Student Name"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {form.role === 'student' && (
                <motion.div
                  key="student-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="group">
                    <label htmlFor="register-enrollment" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Enrollment No.</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-brand-400 transition-colors" />
                      <input
                        id="register-enrollment"
                        name="enrollmentNo"
                        type="text"
                        value={form.enrollmentNo}
                        onChange={handleChange}
                        placeholder="Enrollment No."
                        className="input-field pl-11"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="register-program" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Program</label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-brand-400 transition-colors" />
                      <input
                        id="register-program"
                        name="program"
                        type="text"
                        value={form.program}
                        onChange={handleChange}
                        placeholder="e.g. BCA, B.Tech, BBA"
                        className="input-field pl-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="register-school" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">School / Department</label>
                      <select
                        id="register-school"
                        name="school"
                        value={form.school}
                        onChange={handleChange}
                        className="select-field"
                      >
                        <option value="">Select School</option>
                        {SCHOOLS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="register-semester" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Semester</label>
                      <select
                        id="register-semester"
                        name="semester"
                        value={form.semester}
                        onChange={handleChange}
                        className="select-field"
                      >
                        <option value="">Select</option>
                        {SEMESTERS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {form.role === 'organizer' && (
                <motion.div
                  key="organizer-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label htmlFor="register-club" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Associated Club</label>
                    <select
                      id="register-club"
                      name="club"
                      value={form.club}
                      onChange={handleChange}
                      className="select-field"
                    >
                      <option value="">Select Club</option>
                      {CLUBS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-400/80 text-xs">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Organizer accounts require Super Admin approval. You will be locked to manage events only for your assigned club.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="group">
              <label htmlFor="register-email" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@university.edu"
                  className="input-field pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="register-password" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 chars, 1 upper, 1 lower, 1 symbol"
                  className="input-field pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <div className="group">
              <label htmlFor="register-confirm" className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="register-confirm"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="input-field pl-11"
                />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-400 mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  Passwords do not match
                </motion.p>
              )}
            </div>

            <motion.button
              id="register-submit"
              type="submit"
              disabled={loading || !!success}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
