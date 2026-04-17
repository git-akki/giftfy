import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoMode } from '@/lib/demo-mode';

interface ApiKey {
  id: string;
  keyHash: string;
  keyHint: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

const ApiKeyManager = () => {
  if (isDemoMode()) return <ApiKeyDemoPlaceholder />;
  return <ApiKeyManagerInner />;
};

const ApiKeyDemoPlaceholder = () => (
  <div
    className="rounded-xl p-4 mt-6 text-center"
    style={{ background: 'hsl(0 0% 98%)', boxShadow: '0 0 0 1px hsl(0 0% 92%)' }}
  >
    <p className="font-body font-bold text-foreground text-sm mb-1">API Keys</p>
    <p className="font-body text-muted-foreground text-[10px]">
      Not available in demo mode — needs a real Firestore backend.
    </p>
  </div>
);

const ApiKeyManagerInner = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const loadKeys = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'apiKeys'),
        where('userId', '==', user.uid),
        where('isActive', '==', true),
      );
      const snap = await getDocs(q);
      const loaded: ApiKey[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ApiKey, 'id'>) }));
      loaded.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setKeys(loaded);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const generateKey = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setGenerating(true);
    try {
      const raw = nanoid(32);
      const key = `pk_live_${raw}`;

      // SHA-256 via browser Web Crypto
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(key));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const keyHint = key.slice(-4);

      await addDoc(collection(db, 'apiKeys'), {
        keyHash,
        keyHint,
        userId: currentUser.uid,
        name: 'Default',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      });

      setNewlyGeneratedKey(key);
      await loadKeys();
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    setRevoking(keyId);
    try {
      await updateDoc(doc(db, 'apiKeys', keyId), { isActive: false });
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      if (newlyGeneratedKey) {
        // Clear the newly generated key display if revoked
        const revoked = keys.find((k) => k.id === keyId);
        if (revoked && newlyGeneratedKey.endsWith(revoked.keyHint)) {
          setNewlyGeneratedKey(null);
        }
      }
    } finally {
      setRevoking(null);
    }
  };

  const copyKey = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — nothing to do
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="rounded-xl p-4 mt-6"
      style={{
        background: 'hsl(0 0% 100%)',
        boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04), 0 0 0 1px hsl(0 0% 0% / 0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-body font-bold text-foreground text-sm">API Keys</p>
          <p className="font-body text-muted-foreground text-[10px]">For MCP / programmatic access</p>
        </div>
        <motion.button
          onClick={generateKey}
          disabled={generating}
          whileHover={{ scale: generating ? 1 : 1.05 }}
          whileTap={{ scale: generating ? 1 : 0.95 }}
          className="font-body font-semibold text-[11px] px-3 py-1.5 rounded-full text-white transition-all disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
            boxShadow: '0 2px 8px hsl(345 55% 60% / 0.2)',
          }}
        >
          {generating ? 'Generating…' : '+ New key'}
        </motion.button>
      </div>

      {/* Newly generated key banner */}
      <AnimatePresence>
        {newlyGeneratedKey && (
          <motion.div
            key="new-key-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 rounded-lg p-3"
            style={{ background: 'hsl(150 50% 95%)', border: '1px solid hsl(150 50% 80%)' }}
          >
            <p className="font-body font-semibold text-[10px] text-green-700 mb-1">
              Copy your key now — it won't be shown again
            </p>
            <div className="flex items-center gap-2">
              <code
                className="font-mono text-[10px] text-foreground flex-1 break-all"
                style={{ wordBreak: 'break-all' }}
              >
                {newlyGeneratedKey}
              </code>
              <motion.button
                onClick={() => copyKey(newlyGeneratedKey)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="font-body font-semibold text-[10px] px-2.5 py-1 rounded-full flex-shrink-0 text-white"
                style={{
                  background: copied
                    ? 'hsl(150 50% 45%)'
                    : 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key list */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'hsl(0 0% 96%)' }} />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <p className="font-body text-muted-foreground text-[11px] text-center py-4">
          No active keys — generate one to get started
        </p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {keys.map((k) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: 'hsl(0 0% 98%)', border: '1px solid hsl(0 0% 0% / 0.04)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[11px] text-foreground">
                    pk_live_…{k.keyHint}
                  </p>
                  <p className="font-body text-[10px] text-muted-foreground">
                    Created {formatDate(k.createdAt)}
                    {k.lastUsedAt ? ` · Last used ${formatDate(k.lastUsedAt)}` : ' · Never used'}
                  </p>
                </div>
                <motion.button
                  onClick={() => revokeKey(k.id)}
                  disabled={revoking === k.id}
                  whileHover={{ scale: revoking === k.id ? 1 : 1.05 }}
                  whileTap={{ scale: revoking === k.id ? 1 : 0.95 }}
                  className="font-body text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 transition-colors disabled:opacity-50"
                  style={{
                    background: 'hsl(0 0% 92%)',
                    color: 'hsl(0 0% 35%)',
                  }}
                >
                  {revoking === k.id ? 'Revoking…' : 'Revoke'}
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Usage hint */}
      <div
        className="mt-3 rounded-lg px-3 py-2"
        style={{ background: 'hsl(345 30% 97%)', border: '1px solid hsl(345 30% 90%)' }}
      >
        <p className="font-body text-[10px] text-muted-foreground">
          Use with MCP client:{' '}
          <code className="font-mono text-[10px] text-foreground">
            GIFTFY_API_KEY=pk_live_...
          </code>
        </p>
      </div>
    </div>
  );
};

export default ApiKeyManager;
