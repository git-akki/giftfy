import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";

const Login = () => {
  const { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/dashboard';
      navigate(redirect, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Name is required'); setSubmitting(false); return; }
        await signUpWithEmail(email, password, name.trim());
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') setError('This email is already registered. Try logging in.');
      else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setError('Wrong email or password.');
      else if (code === 'auth/user-not-found') setError('No account found. Try signing up.');
      else if (code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else if (code === 'auth/invalid-email') setError('Invalid email address.');
      else setError(err?.message || 'Something went wrong.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💝</div>
          <h1 className="font-display text-4xl text-gradient-giftfy mb-1">Giftfy</h1>
          <p className="font-body text-muted-foreground text-xs">
            Sign in to create a gift 💖
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-full p-1 mb-6"
          style={{ background: 'hsl(0 0% 95%)' }}>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className="flex-1 font-body font-semibold text-xs py-2 rounded-full transition-all"
            style={{
              background: mode === 'login' ? 'white' : 'transparent',
              color: mode === 'login' ? 'hsl(345 55% 50%)' : 'hsl(0 0% 50%)',
              boxShadow: mode === 'login' ? '0 1px 4px hsl(0 0% 0% / 0.06)' : 'none',
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className="flex-1 font-body font-semibold text-xs py-2 rounded-full transition-all"
            style={{
              background: mode === 'signup' ? 'white' : 'transparent',
              color: mode === 'signup' ? 'hsl(345 55% 50%)' : 'hsl(0 0% 50%)',
              boxShadow: mode === 'signup' ? '0 1px 4px hsl(0 0% 0% / 0.06)' : 'none',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Moli"
              className="w-full font-body text-sm px-4 py-3 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              style={{ border: '1px solid hsl(0 0% 88%)' }}
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full font-body text-sm px-4 py-3 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            style={{ border: '1px solid hsl(0 0% 88%)' }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full font-body text-sm px-4 py-3 rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            style={{ border: '1px solid hsl(0 0% 88%)' }}
          />

          {error && (
            <p className="font-body text-xs px-3 py-2 rounded-lg" style={{ background: 'hsl(0 80% 97%)', color: 'hsl(0 70% 45%)' }}>
              {error}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full font-body font-semibold text-sm py-3 rounded-full text-white transition-all disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
              boxShadow: '0 3px 12px hsl(345 55% 60% / 0.25)',
            }}
          >
            {submitting ? '...' : mode === 'signup' ? 'Create Account' : 'Log In'}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'hsl(0 0% 90%)' }} />
          <span className="font-body text-muted-foreground text-[10px]">or</span>
          <div className="flex-1 h-px" style={{ background: 'hsl(0 0% 90%)' }} />
        </div>

        {/* Google */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 font-body font-semibold text-sm px-6 py-3 rounded-full transition-all"
          style={{
            background: 'hsl(0 0% 100%)',
            boxShadow: '0 1px 8px hsl(0 0% 0% / 0.06), 0 0 0 1px hsl(0 0% 0% / 0.06)',
            color: 'hsl(0 0% 25%)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </motion.button>

        <p className="font-body text-muted-foreground/40 text-[9px] mt-5 text-center">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
