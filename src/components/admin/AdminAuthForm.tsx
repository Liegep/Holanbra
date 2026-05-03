import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../../lib/supabase';

export function AdminAuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center space-y-8 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(247,203,69,0.1)] mb-4"
        >
          <span className="text-black font-black text-3xl">H</span>
        </motion.div>
        
        <div className="space-y-2">
          <h3 className="text-white font-bold uppercase tracking-[0.3em] text-sm">Executive Protection</h3>
          <p className="text-white/30 text-[10px] uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
            Secure authentication required for executive administrative access
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl w-full">
            <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">{error}</p>
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-white text-black font-black flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Identity verification via Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
