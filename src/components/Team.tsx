import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ShieldCheck, Paintbrush, Briefcase, Scale, Users, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  icon: string;
  slProfile: string;
}

const ICON_MAP: Record<string, any> = {
  Paintbrush,
  Briefcase,
  Scale,
  ShieldCheck,
  Users
};

export default function Team() {

  const DEFAULT_TEAM: TeamMember[] = [
    {
      id: 'default-1',
      name: 'Marie Whitfield',
      role: 'Creative Director',
      bio: 'Creative director focused on luxury design and immersive experiences.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
      icon: 'Paintbrush',
      slProfile: 'secondlife:///app/agent/uuid-marie/about'
    },
    {
      id: 'default-2',
      name: 'Ymir Coronet',
      role: 'Founder & Architect',
      bio: 'Founding architect specializing in urban planning and modular design.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
      icon: 'Briefcase',
      slProfile: 'secondlife:///app/agent/uuid-ymir/about'
    },
    {
      id: 'default-3',
      name: 'Victoria Holanbra',
      role: 'Community Manager',
      bio: 'Community manager dedicated to connecting residents and managing events.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
      icon: 'Users',
      slProfile: 'secondlife:///app/agent/uuid-victoria/about'
    }
  ];

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (data) {
        setTeam(data.map(m => ({ 
          ...m, 
          image: m.photo_url || m.image, // Fallback to image if photo_url is empty during transition
          slProfile: m.sl_url || m.sl_profile || '#'
        })));
      }
      setLoading(false);
    };

    fetchTeam();

    const teamSubscription = supabase
      .channel('team_public_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team' }, fetchTeam)
      .subscribe();

    return () => {
      supabase.removeChannel(teamSubscription);
    };
  }, []);

  const [notice, setNotice] = useState<string | null>(null);
  const [activeMessageTarget, setActiveMessageTarget] = useState<any>(null);
  const [visitorData, setVisitorData] = useState({ name: '', message: '' });
  const [isSending, setIsSending] = useState(false);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorData.name || !visitorData.message || !activeMessageTarget) return;

    setIsSending(true);
    try {
      // Sending ONLY the requested columns
      const { error: supabaseError } = await supabase.from('contacts').insert([{
        visitor_name: visitorData.name,
        message: visitorData.message,
        recipient_name: activeMessageTarget.name
      }]);

      if (supabaseError) throw supabaseError;

      setNotice("Message Sent Successfully");
      setActiveMessageTarget(null);
      setVisitorData({ name: '', message: '' });
      setTimeout(() => setNotice(null), 5000);
    } catch (err: any) {
      console.error("CRITICAL ERROR SENDING MESSAGE:", err);
      window.alert("Error sending message: " + (err.message || ""));
    } finally {
      setIsSending(false);
    }
  };

  const handleIMClick = (e: React.MouseEvent, member: any) => {
    e.preventDefault();
    setActiveMessageTarget(member);
  };

  const displayTeam = team.length > 0 ? team : DEFAULT_TEAM;

  const translateRole = (role: string) => {
    return role;
  };

  return (
    <section id="team" className="py-32 px-6 bg-background-light relative overflow-hidden">
      {/* Quick Notice Overlay */}
      {notice && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-black text-white rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 animate-in fade-in slide-in-from-top-4">
          ✨ {notice}
        </div>
      )}
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 blur-[100px] -ml-32 -mb-32" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-24">
          <div className="space-y-4">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="flex items-center gap-3 text-amber-600"
            >
              <div className="w-12 h-[1px] bg-amber-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">{'OUR TEAM'}</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-black"
            >
              OUR TEAM
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-black/40 max-w-sm text-sm uppercase tracking-widest leading-relaxed"
          >
            Meet the creative minds behind Holanbra. Our diverse team of architects and designers is dedicated to crafting extraordinary virtual spaces.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayTeam.map((member, index) => {
            const IconComponent = ICON_MAP[member.icon] || Users;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden mb-8 bg-black/5 border-black/5 shadow-2xl">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* SL Profile Button */}
                  <div className="absolute top-6 right-6 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <a 
                      href="#" 
                      onClick={(e) => handleIMClick(e, member)}
                      className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-500/30 hover:bg-black hover:text-white transition-all group/btn"
                    >
                      <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform" />
                      Send Message
                    </a>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 backdrop-blur-xl border border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 rounded-3xl shadow-lg">
                     <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <IconComponent size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{translateRole(member.role)}</span>
                     </div>
                     <h3 className="text-xl font-bold text-black tracking-tight">{member.name}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-black/40 px-4 leading-relaxed line-clamp-2">
                  {member.bio}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Message Modal */}
      {activeMessageTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setActiveMessageTarget(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
          >
            {/* Header */}
            <div className="relative aspect-video">
              <img 
                src={activeMessageTarget.image || activeMessageTarget.photo_url} 
                className="w-full h-full object-cover grayscale opacity-40" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
              <div className="absolute bottom-6 left-8 right-8">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Direct Message</p>
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{activeMessageTarget.name}</h4>
                <p className="text-[10px] text-white/40 font-mono mt-1">{translateRole(activeMessageTarget.role)}</p>
              </div>
              <button 
                onClick={() => setActiveMessageTarget(null)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitMessage} className="p-8 pt-2 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Your Second Life Name</label>
                  <input 
                    required
                    type="text"
                    value={visitorData.name}
                    onChange={(e) => setVisitorData({ ...visitorData, name: e.target.value })}
                    placeholder="Ex: Resident Name"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/10 focus:border-amber-500 outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Your Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={visitorData.message}
                    onChange={(e) => setVisitorData({ ...visitorData, message: e.target.value })}
                    placeholder="Write your message here..."
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/10 focus:border-amber-500 outline-none transition-all shadow-inner resize-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSending}
                className="w-full py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 disabled:opacity-30 group"
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> SENDING...
                  </>
                ) : (
                  <>
                    SEND MESSAGE <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
}

