import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ShieldCheck, Paintbrush, Briefcase, Scale, Users } from 'lucide-react';
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

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 'default-1',
    name: 'Marie Whitfield',
    role: 'Creative Director',
    bio: 'Specialist in interior design and landscaping. Turning pixels into cozy homes since 2010.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    icon: 'Paintbrush',
    slProfile: 'secondlife:///app/agent/uuid-marie/about'
  },
  {
    id: 'default-2',
    name: 'Ymir Coronet',
    role: 'Founder & Architect',
    bio: 'Visionary architect behind Holanbra. Dedicated to crafting uniquely designed virtual worlds.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
    icon: 'Briefcase',
    slProfile: 'secondlife:///app/agent/uuid-ymir/about'
  },
  {
    id: 'default-3',
    name: 'Victoria Holanbra',
    role: 'Community Manager',
    bio: 'Ensuring every resident feels at home and every issue is resolved with a smile.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
    icon: 'Users',
    slProfile: 'secondlife:///app/agent/uuid-victoria/about'
  }
];

export default function Team() {
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

  const handleIMClick = (e: React.MouseEvent, url: string) => {
    if (url === '#') {
      e.preventDefault();
      return;
    }
    setNotice("Abrindo contato no Second Life...");
    setTimeout(() => setNotice(null), 3000);
  };

  const displayTeam = team.length > 0 ? team : DEFAULT_TEAM;

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
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Minds Behind</span>
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
            A diverse group of professionals dedicated to redefining the virtual real estate experience in Second Life.
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
                      href={member.slProfile} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={(e) => handleIMClick(e, member.slProfile)}
                      className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-500/30 hover:bg-black hover:text-white transition-all group/btn"
                    >
                      <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform" />
                      Send IM
                    </a>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 backdrop-blur-xl border border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 rounded-3xl shadow-lg">
                     <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <IconComponent size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{member.role}</span>
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
    </section>
  );
}

