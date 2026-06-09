import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight, Zap, MailOpen } from 'lucide-react';
import api from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [status, setStatus] = useState(token ? 'verifying' : 'waiting');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let intervalId;

    if (token) {
      const verify = async () => {
        try {
          const { data } = await api.get(`/auth/verify/${token}`);
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully!');
        } catch (err) {
          setStatus('error');
          setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
        }
      };
      verify();
    } else if (email) {
      intervalId = setInterval(async () => {
        try {
          const { data } = await api.get(`/auth/check-status/${encodeURIComponent(email)}`);
          if (data.isVerified) {
            setStatus('success');
            setMessage('Your email has been verified successfully!');
            clearInterval(intervalId);
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        } catch (err) {
        }
      }, 3000);
    } else {
      setStatus('error');
      setMessage('No verification token or email found. Please check your email link or try registering again.');
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, email, navigate]);

  const statusConfig = {
    waiting: {
      icon: <MailOpen className="w-16 h-16 text-amber-400 animate-pulse" />,
      title: 'Waiting for Verification',
      subtitle: `We sent a verification link to ${email}. Please check your phone or desktop inbox. This page will automatically update once verified.`,
      color: 'amber',
    },
    verifying: {
      icon: <Loader2 className="w-16 h-16 text-brand-400 animate-spin" />,
      title: 'Verifying Your Email',
      subtitle: 'Please wait while we confirm your account...',
      color: 'brand',
    },
    success: {
      icon: <CheckCircle className="w-16 h-16 text-emerald-400" />,
      title: 'Email Verified!',
      subtitle: message,
      color: 'emerald',
    },
    error: {
      icon: <XCircle className="w-16 h-16 text-red-400" />,
      title: 'Verification Failed',
      subtitle: message,
      color: 'red',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl"
        />
        <motion.div
          animate={{ y: [20, -20, 20] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md text-center"
      >
        <div className="glass-card-deep rounded-3xl p-10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-glow-sm">
            <Zap className="w-7 h-7 text-white" />
          </div>

          <motion.div
            key={status}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6 flex justify-center"
          >
            <div className="relative">
              {config.icon}
              {status === 'success' && (
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-glow-pulse" />
              )}
            </div>
          </motion.div>

          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">
            {config.title}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
            {config.subtitle}
          </p>

          {status !== 'verifying' && status !== 'waiting' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/login">
                <motion.button
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue to Sign In
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
