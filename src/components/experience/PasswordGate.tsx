import { useState } from 'react';
import { motion } from 'framer-motion';
import { verifyPassword } from '@/lib/password';

interface PasswordGateProps {
  correctPassword: string;
  onUnlock: () => void;
  recipientName: string;
}

const PasswordGate = ({ correctPassword, onUnlock, recipientName }: PasswordGateProps) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying) return;
    setVerifying(true);
    try {
      const ok = await verifyPassword(input, correctPassword);
      if (ok) {
        onUnlock();
      } else {
        setError(true);
      }
    } catch {
      // crypto.subtle unavailable or stored value malformed — fail-closed.
      setError(true);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm w-full"
      >
        <div className="text-5xl mb-4 animate-gentle-float">🔒</div>
        <h2 className="font-display text-3xl font-bold text-gradient-giftfy mb-2">
          A gift for {recipientName}
        </h2>
        <p className="font-body text-sm text-gray-400 mb-6">
          Enter the password to unwrap your gift
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Enter password"
            className="w-full font-body text-sm px-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-200 text-center"
          />
          {error && <p className="font-body text-xs text-red-400">Wrong password, try again</p>}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full gradient-btn text-white font-body font-bold text-sm py-3 rounded-full"
          >
            Unwrap Gift 💝
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default PasswordGate;
