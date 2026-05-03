import React, { useState, useEffect, FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { GridStatus } from './GridStatus';
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
  Lock,
  MessageSquare,
  Plus,
  History,
  CheckCircle2,
  AlertCircle,
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import Toast, { ToastType } from './Toast';

const ResidentDashboard:FC = () => {
  const [toast, setToast] = useState<{ message: string, type: ToastType, visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };
  const [avatarName, setAvatarName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [residentData, setResidentData] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'rentals' | 'support'>('rentals');
  const [error, setError] = useState('');
  
  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Billing',
    message: ''
  });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Auto-login if session exists
  useEffect(() => {
    const savedName = localStorage.getItem('sl_resident_name');
    const savedPass = localStorage.getItem('sl_resident_pass');
    if (savedName && savedPass) {
      handleLogin(null, savedName, savedPass);
    }
  }, []);

  // Sync and fetch tickets
  useEffect(() => {
    if (isLoggedIn && residentData) {
      const residentId = residentData.avatar_uuid;
      
      const fetchInitialData = async () => {
        // Fetch tickets strictly by avatar_uuid
        const { data: userTickets, error: ticketError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', residentId)
          .order('created_at', { ascending: false });

        if (!ticketError) {
          setTickets(userTickets || []);
        }
      };
      fetchInitialData();
    }
  }, [isLoggedIn, residentData]);

  const handleLogin = async (e: React.FormEvent | null, nameOverride?: string, passOverride?: string) => {
    if (e) e.preventDefault();
    setError('');
    
    // Use overrides for auto-login, otherwise use state
    const cleanName = (nameOverride || avatarName).trim();
    const cleanPass = (passOverride || password).trim();

    if (!cleanName || !cleanPass) {
        setError("Please fill all fields");
        return;
    }

    setLoading(true);
    try {
      // Step 1: Login via 'renters' table (Exact col selection + maybeSingle)
      const { data: renter, error: renterError } = await supabase
        .from('renters')
        .select('avatar_name,avatar_uuid,password')
        .eq('avatar_name', cleanName)
        .eq('password', cleanPass)
        .maybeSingle();

      if (renterError) {
        console.error('Erro na busca:', renterError);
        throw renterError;
      }

      if (!renter) {
        alert('Invalid credentials. Please check the Avatar Name and Password.');
        if (nameOverride) handleLogout(); // Clear stale session
        return;
      }

      // Se chegou aqui, logou!
      console.log('Sucesso!', renter);
      setResidentData(renter);

      // Step 2: Fetch properties linked to this resident
      const residentId = renter.avatar_uuid;
      const { data: userProperties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('tenant_id', residentId);

      if (propError) throw propError;

      // Step 3: Fetch tickets
      const { data: userTickets } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', residentId)
        .order('created_at', { ascending: false });

      setTickets(userTickets || []);
      setProperties(userProperties || []);
      setIsLoggedIn(true);
      
      // Persist session
      localStorage.setItem('sl_resident_name', cleanName);
      localStorage.setItem('sl_resident_pass', cleanPass);
      localStorage.setItem('sl_resident_uuid', renter.avatar_uuid || '');
      
      showToast(`Welcome back, ${cleanName}!`);
    } catch (err: any) {
      console.error("Login process error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      showToast("Please fill all fields", "info");
      return;
    }

    setIsSubmittingTicket(true);
    
    try {
      // Prioritize residentData, then localStorage
      const sessionUuid = residentData?.avatar_uuid || localStorage.getItem('sl_resident_uuid');
      const sessionName = residentData?.avatar_name || localStorage.getItem('sl_resident_name') || 'Resident';

      if (!sessionUuid) {
        throw new Error("Session invalid. Please log in again.");
      }

      console.log("Submitting ticket for UUID:", sessionUuid);

      const payload = {
        user_id: sessionUuid.trim(),
        avatar_name: sessionName.trim(),
        subject: ticketForm.subject.trim(),
        category: ticketForm.category,
        message: ticketForm.message.trim(),
        status: 'open'
      };

      const { data, error } = await supabase
        .from('support_tickets')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Supabase Support Ticket Error:", error.message, error.details);
        throw error;
      }

      setTickets(prev => [data, ...prev]);
      setTicketForm({ subject: '', category: 'Billing', message: '' });
      showToast("Ticket sent successfully");
    } catch (err: any) {
      console.error("Ticket submission error:", err);
      const errorMsg = err.message || "Unknown error";
      showToast(`Error sending ticket: ${errorMsg}`, "error");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setResidentData(null);
    setProperties([]);
    setTickets([]);
    setAvatarName('');
    setPassword('');
    localStorage.removeItem('sl_resident_name');
    localStorage.removeItem('sl_resident_pass');
    localStorage.removeItem('sl_resident_uuid');
    showToast("Logged out successfully", "info");
  };

  if (loading && !isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-white/5 rounded-full absolute inset-0 animate-ping"></div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-background-dark border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]"
          >
            <ShieldCheck className="text-amber-500" size={32} />
          </motion.div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-amber-500 font-bold uppercase tracking-[0.5em] text-[10px] animate-pulse">Authenticating</h2>
        </div>
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
            <p className="text-white/40 text-sm">Access your properties and support</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 ml-1">Avatar Name</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                        type="text" 
                        autoComplete="off"
                        value={avatarName}
                        onChange={(e) => setAvatarName(e.target.value)}
                        placeholder="Your Avatar Name"
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

          <Link to="/" className="block text-[10px] uppercase font-bold text-white/20 hover:text-white transition-colors">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark text-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header - Profile Section */}
        <div className="flex flex-col items-center text-center gap-8 bg-white/5 p-12 rounded-[40px] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-12 mt-8">
            <GridStatus />
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 aspect-square rounded-2xl overflow-hidden border border-[#f59e0b] shadow-[0_0_40px_rgba(245,158,11,0.2)] bg-zinc-900">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(residentData?.avatar_name || 'Resident')}&background=111111&color=f59e0b&size=256&bold=true&format=svg`} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-background-dark rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck size={16} className="text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 text-amber-500">
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">AUTHENTICATED SESSION</span>
              </div>
              <h1 className="text-4xl font-display font-bold tracking-tighter capitalize text-white">
                {residentData?.avatar_name}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest bg-white/5 px-3 py-1 rounded-md border border-white/5">
                  {residentData?.tenant_id || residentData?.avatar_uuid}
                </p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 px-8 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest text-[10px] font-black rounded-full border border-red-500/20 shadow-lg"
            >
              <LogOut size={14} /> LOGOUT
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 border-b border-white/5 pb-4">
          <button 
            onClick={() => setActiveTab('rentals')}
            className={cn(
              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'rentals' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white"
            )}
          >
            <Home size={14} /> My Rentals ({properties.length})
          </button>
          <button 
            onClick={() => setActiveTab('support')}
            className={cn(
              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'support' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white"
            )}
          >
            <MessageSquare size={14} /> Support ({tickets.length})
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'rentals' ? (
            <motion.div 
              key="rentals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {properties.length === 0 ? (
                <div className="glass-card p-20 text-center space-y-6 border-white/5">
                   <Home size={60} className="mx-auto text-white/10" />
                   <div className="space-y-2">
                      <p className="text-xl text-white font-medium">No rentals found</p>
                      <p className="text-white/40 max-w-md mx-auto">Explore our properties and start your new life in Holanbra.</p>
                   </div>
                   <Link to="/#properties" className="inline-block px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-black hover:bg-white hover:text-black transition-all">
                     Browse Properties
                   </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {properties.map((prop) => {
                    const expiresAt = prop.expiry_date || prop.expiry || prop.expires_at || prop.next_payment;
                    const daysLeft = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
                    
                    return (
                      <motion.div 
                        key={prop.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-[40px] overflow-hidden border-white/5 group"
                      >
                        {/* Property Image Header */}
                        <div className="relative h-64 overflow-hidden">
                          <img src={prop.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent" />
                          <div className="absolute bottom-6 left-8">
                            <h3 className="text-3xl font-bold text-white tracking-tighter">{prop.name}</h3>
                            <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                              <MapPin size={12} /> HOLANBRA
                            </div>
                          </div>
                        </div>

                        {/* Rental Stats */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="glass-card bg-white/5 p-6 rounded-3xl border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                              <Clock className="text-amber-500" size={20} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</span>
                            </div>
                            <div>
                              <p className={`text-4xl font-display font-black ${daysLeft <= 0 ? 'text-red-500' : 'text-white'}`}>
                                  {daysLeft <= 0 ? "EXPIRED" : `${daysLeft} Days`}
                              </p>
                              <p className="text-xs text-white/40 mt-1 uppercase tracking-tighter">Remaining Time</p>
                            </div>
                          </div>

                          <div className="glass-card bg-white/5 p-6 rounded-3xl border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                              <Calendar className="text-amber-500" size={20} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Expires</span>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-white">{expiresAt ? new Date(expiresAt).toLocaleDateString() : "Active"}</p>
                              <p className="text-xs text-white/40 mt-1 uppercase tracking-tighter">Due Date</p>
                            </div>
                          </div>

                          <div className="glass-card bg-white/5 p-6 rounded-3xl border-white/5 space-y-4 col-span-full">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <CreditCard className="text-amber-500" size={20} />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Rental Price</span>
                               </div>
                               <div className="px-3 py-1 bg-amber-500 text-black text-[10px] font-black rounded-full uppercase tracking-tighter">L$ {prop.rental_price || prop.price} / Week</div>
                             </div>
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
                                <p className="text-[10px] text-white/60 leading-relaxed max-w-xs">
                                  Manage your extensions directly at the rental box in {prop.name}.
                                </p>
                                <button 
                                  onClick={() => window.open(prop.teleport_url, '_blank')}
                                  className="w-full md:w-auto px-6 py-3 bg-white text-black text-[10px] font-black uppercase rounded-full hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                  <MapPin size={12} /> Visit Property
                                </button>
                             </div>
                          </div>
                </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* New Ticket Form */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-8 border-white/5 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black">
                      <Plus size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display">New Ticket</h3>
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Submit a request to our staff</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-1">Subject</label>
                      <input 
                        type="text"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white text-sm outline-none focus:border-amber-500/50"
                        placeholder="Ex: Rental extension"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-1">Category</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <select 
                          value={ticketForm.category}
                          onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                        >
                          <option value="Billing" className="bg-zinc-900">Billing</option>
                          <option value="Land Issue" className="bg-zinc-900">Land Issue</option>
                          <option value="Others" className="bg-zinc-900">Others</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-1">Message</label>
                      <textarea 
                        rows={5}
                        value={ticketForm.message}
                        onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-amber-500/50 resize-none"
                        placeholder="Write your message here..."
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmittingTicket}
                      className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-50"
                    >
                      {isSubmittingTicket ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                      SUBMIT
                    </button>
                  </form>
                </div>
              </div>

              {/* Ticket History */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="text-white/20" size={20} />
                    <h3 className="text-lg font-bold font-display">Recent Tickets</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {tickets.length === 0 ? (
                    <div className="glass-card p-20 text-center border-dashed border-white/5">
                      <p className="text-white/20 text-[10px] uppercase font-black tracking-widest">No tickets found</p>
                    </div>
                  ) : (
                    tickets.map((ticket) => {
                      return (
                        <div key={ticket.id} className="glass-card p-6 border-white/5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {ticket.status === 'open' ? (
                                  <AlertCircle className="text-amber-500" size={14} />
                                ) : (
                                  <CheckCircle2 className="text-green-500" size={14} />
                                )}
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded",
                                  ticket.status === 'open' ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
                                )}>
                                  {ticket.status === 'open' ? "OPEN" : "RESOLVED"}
                                </span>
                                <span className="text-[10px] text-white/20 uppercase font-black tracking-widest ml-2">
                                  {ticket.category || "General"}
                                </span>
                              </div>
                              <h4 className="text-lg font-bold text-white">{ticket.subject}</h4>
                              <p className="text-white/40 text-[10px] uppercase font-bold">
                                Opened on {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
  
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-sm text-white/80 leading-relaxed italic">"{ticket.message}"</p>
                          </div>
  
                          {ticket.admin_reply && (
                            <div className="bg-blue-900/40 p-4 mt-2 rounded-xl border border-blue-500/30 space-y-3">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="text-blue-400" size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Staff Response</span>
                              </div>
                              <p className="text-sm text-white/80 leading-relaxed">{ticket.admin_reply}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Toast 
          message={toast.message} 
          type={toast.type} 
          isVisible={toast.visible} 
          onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
        />
      </div>
    </div>
  );
};

export default ResidentDashboard;
