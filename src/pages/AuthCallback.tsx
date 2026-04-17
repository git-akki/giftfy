import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the OAuth callback automatically via onAuthStateChange
    // Just redirect to dashboard after a brief moment
    const timer = setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">✨</div>
        <p className="font-body text-muted-foreground text-sm">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
