import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Home, 
  Calendar, 
  Clock, 
  CreditCard, 
  MapPin, 
  LogOut, 
  LogIn,
  Loader2,
  ShieldCheck,
  User,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ResidentDashboard: React.FC = () => {
  const [residentName, setResidentName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Auto-login if session exists
  useEffect(() => {
    const savedName = localStorage.getItem('sl_resident_name');
    const savedPass = localStorage.getItem('sl_resident_pass');
    if (savedName && savedPass) {
      handleLogin(null, savedName, savedPass);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent | null, nameOverride?: string, passOverride?: string) => {
    if (e) e.preventDefault();
    setError('');
    const name = nameOverride || residentName;
    const pass = passOverride || password;

    if (!name || !pass) {
        setError('Please enter both name and password.');
        return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'properties'), 
        where('tenantName', '==', name),
        where('tenantPassword', '==', pass)
      );

      const snapshot = await getDocs(q);
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (p.length > 0) {
        setProperties(p);
        setIsLoggedIn(true);
        localStorage.setItem('sl_resident_name', name);
        localStorage.setItem('sl_resident_pass', pass);
      } else {
        setError('Invalid resident name or password. Please check your credentials.');
        if (nameOverride) {
            handleLogout();
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setProperties([]);
    setResidentName('');
    setPassword('');
    localStorage.removeItem('sl_resident_name');
    localStorage.removeItem('sl_resident_pass');
  };

  if (loading && !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark px-6 py-20">
        <div className="max-w-md w-full glass-card p-12 text-center space-y-8 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_20px_amber-500/50]"></div>
          
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
            <ShieldCheck className="text-amber-500" size={40} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Resident Portal</h1>
            <p className="text-white/40 text-sm">Access your rental dashboard with your provided SL name and access key.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 ml-1">SL Username</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                        type="text" 
                        value={residentName}
                        onChange={(e) => setResidentName(e.target.value)}
                        placeholder="John Resident"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-amber-500/50 outline-none transition-all"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 ml-1">Access Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-amber-500/50 outline-none transition-all"
                    />
                </div>
            </div>

            {error && <p className="text-red-400 text-[10px] uppercase font-bold tracking-tighter text-center">{error}</p>}

            <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-3 hover:bg-amber-400 transition-all shadow-xl shadow-white/5"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />} 
                Enter Dashboard
            </button>
          </form>

          <Link to="/" className="block text-[10px] uppercase font-bold text-white/20 hover:text-white transition-colors">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Resident Dashboard</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter capitalize">
              Welcome, {localStorage.getItem('sl_resident_name')?.split(' ')[0]}
            </h1>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors uppercase tracking-widest text-[10px] font-black"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="glass-card p-20 text-center space-y-6 border-white/5">
             <Home size={60} className="mx-auto text-white/10" />
             <div className="space-y-2">
                <p className="text-xl text-white font-medium">No active rentals</p>
                <p className="text-white/40 max-w-md mx-auto">We couldn't find any properties currently assigned to this account.</p>
             </div>
             <Link to="/#imoveis" className="inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-black hover:bg-white hover:text-black transition-all">
               Browse Catalog
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {properties.map((prop) => {
              const daysLeft = prop.nextPayment ? Math.ceil((new Date(prop.nextPayment).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
              
              return (
                <motion.div 
                  key={prop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-[40px] overflow-hidden border-white/5 group"
                >
                  {/* Property Image Header */}
                  <div className="relative h-64 overflow-hidden">
                    <img src={prop.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-8">
                      <h3 className="text-3xl font-bold text-white tracking-tighter">{prop.name}</h3>
                      <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                        <MapPin size={12} /> {prop.location}
                      </div>
                    </div>
                  </div>

                  {/* Rental Stats */}
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card bg-white/5 p-6 rounded-3xl border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <Clock className="text-amber-500" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Time Status</span>
                      </div>
                      <div>
                        <p className={`text-4xl font-display font-black ${daysLeft <= 0 ? 'text-red-500' : 'text-white'}`}>
                            {daysLeft <= 0 ? '0' : daysLeft} Days
                        </p>
                        <p className="text-xs text-white/40 mt-1 uppercase tracking-tighter">Remaining until next cycle</p>
                      </div>
                    </div>

                    <div className="glass-card bg-white/5 p-6 rounded-3xl border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <Calendar className="text-amber-500" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Next Payment</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{prop.nextPayment ? new Date(prop.nextPayment).toLocaleDateString() : 'N/A'}</p>
                        <p className="text-xs text-white/40 mt-1 uppercase tracking-tighter">Scheduled due date</p>
                      </div>
                    </div>

                    <div className="glass-card bg-white/5 p-6 rounded-3xl border-white/5 space-y-4 col-span-full">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <CreditCard className="text-amber-500" size={20} />
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Payment Info</span>
                         </div>
                         <div className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[8px] font-black rounded-full uppercase">L$ {prop.price} / week</div>
                       </div>
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
                          <p className="text-[10px] text-white/60 leading-relaxed max-w-xs">
                            Your payment is handled in-world via our CasperLet meters at the property location.
                          </p>
                          <button 
                            onClick={() => window.open(prop.slurl, '_blank')}
                            className="w-full md:w-auto px-6 py-3 bg-amber-500 text-black text-[10px] font-black uppercase rounded-full hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                          >
                            <MapPin size={12} /> Go to Meter
                          </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentDashboard;
