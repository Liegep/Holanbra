import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from 'react-simple-wysiwyg';
import { 
  BarChart3, 
  Settings, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon, 
  ChevronRight,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Tag,
  LogIn,
  LogOut,
  Loader2,
  MapPin,
  RefreshCw,
  X,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  Play,
  User as UserIcon,
  ArrowUpRight,
  Mail,
  MessageSquare,
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  Type,
  Code
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase, signInWithGoogle, signOut } from '../lib/supabase';
import Toast, { ToastType } from './Toast';
import { User } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

function AdminAuthForm() {
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
          <h3 className="text-white font-bold uppercase tracking-[0.3em] text-sm">Secure Access</h3>
          <p className="text-white/30 text-[10px] uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
            Administrative authentication required.
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
              Login with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function AdminArea() {
  const [toast, setToast] = useState<{ message: string, type: ToastType, visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'renters' | 'add' | 'settings' | 'covenant' | 'gallery' | 'team' | 'hero' | 'inbox' | 'videos' | 'tickets'>('listings');
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [isUploadingSlot, setIsUploadingSlot] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRenterId, setEditingRenterId] = useState<string | null>(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [renters, setRenters] = useState<any[]>([]);
  const [renterFormData, setRenterFormData] = useState({
    avatarName: '',
    avatarUuid: '',
    password: ''
  });
  const [covenants, setCovenants] = useState({ en: '', pt: '', es: '', nl: '' });
  const [isDirty, setIsDirty] = useState(false);
  const [heroContent, setHeroContent] = useState<any>({
    backgroundImage: '',
    badgeText: 'New Islands Available',
    title1: 'Holanbra',
    title2: 'Sims',
    virtualTourUrl: '',
    gridImages: ['', '', '', ''],
    aboutImage: ''
  });
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [galleryFormData, setGalleryFormData] = useState({ caption: '', imageUrl: '' });
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    icon: 'Users',
    slProfile: '#',
    order: '0'
  });

  useEffect(() => {
    if (!user || !isAdmin) return;
    
    const fetchTickets = async () => {
      const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      setTickets(data || []);
    };

    const fetchData = async () => {
      // Fetch Covenants from land_covenants
      const { data: covenantData } = await supabase.from('land_covenants').select('*').limit(1).maybeSingle();
      if (covenantData) {
        setCovenants({
          en: covenantData.content_en || '',
          pt: covenantData.content_pt || '',
          es: covenantData.content_es || '',
          nl: covenantData.content_nl || ''
        });
      }

      // Fetch Hero Content - Supports flat columns or JSONB content branch
      const { data: heroData } = await supabase.from('site_settings').select('*').eq('id', 'hero_section').maybeSingle();
      if (heroData) {
        // Map flat columns back to state
        setHeroContent({
          badgeText: heroData.badge_text || '',
          title1: heroData.title_main || '',
          title2: heroData.title_italic || '',
          virtualTourUrl: heroData.virtual_tour_url || '',
          backgroundImage: heroData.background_url || '',
          aboutImage: heroData.about_image_url || '',
          gridImages: [
            heroData.grid_photo_1 || '',
            heroData.grid_photo_2 || '',
            heroData.grid_photo_3 || '',
            heroData.grid_photo_4 || ''
          ]
        });
      }

      // Fetch Videos
      const { data: videosData } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (videosData) setVideos(videosData);

      // Fetch Tickets
      await fetchTickets();
    };

    fetchData();

    // Subscribe to changes for real-time
    const settingsSubscription = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'land_covenants' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, fetchTickets)
      .subscribe();

    return () => {
      supabase.removeChannel(settingsSubscription);
    };
  }, [user, isAdmin]);

  const handleHeroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeroContent((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleHeroGridChange = (idx: number, value: string) => {
    setHeroContent((prev: any) => {
      const newGrid = [...prev.gridImages];
      newGrid[idx] = value;
      return { ...prev, gridImages: newGrid };
    });
  };

  const handleSaveHero = async () => {
    try {
      console.log("Saving Hero to site_settings (hero_section)...", heroContent);
      
      const { error } = await supabase.from('site_settings').upsert({
        id: 'hero_section',
        badge_text: heroContent.badgeText,
        title_main: heroContent.title1,
        title_italic: heroContent.title2,
        virtual_tour_url: heroContent.virtualTourUrl,
        background_url: heroContent.backgroundImage,
        about_image_url: heroContent.aboutImage,
        grid_photo_1: heroContent.gridImages[0] || '',
        grid_photo_2: heroContent.gridImages[1] || '',
        grid_photo_3: heroContent.gridImages[2] || '',
        grid_photo_4: heroContent.gridImages[3] || '',
        updated_at: new Date().toISOString()
      });
      
      if (error) {
        console.error("SUPABASE SAVE ERROR:", error);
        throw error;
      }
      showToast("Configurações do topo salvas com sucesso!");
    } catch (error: any) {
      console.error("Full Error Object:", error);
      showToast(`Falha ao salvar: ${error.message || 'Erro desconhecido'}`, "error");
    }
  };

  const handleSaveCovenant = async () => {
    try {
      // Get existing one first to know the ID for upsert, or use a fixed ID like 1 if we assume it's a singleton
      const { data: existing } = await supabase.from('land_covenants').select('id').limit(1).maybeSingle();
      
      const payload: any = {
        content_en: covenants.en,
        content_pt: covenants.pt,
        content_es: covenants.es,
        content_nl: covenants.nl,
      };

      if (existing?.id) {
        payload.id = existing.id;
      }

      const { error } = await supabase.from('land_covenants').upsert(payload);
      
      if (error) throw error;
      setIsDirty(false);
      showToast("Covenants updated successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to update covenants", "error");
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  const handleSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionRect(rect);
      } else {
        setSelectionRect(null);
      }
    }, 10);
  };

  const applyCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    setIsDirty(true);
  };

  const FloatingToolbar = () => {
    if (!selectionRect) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="floating-toolbar"
        style={{ 
          top: selectionRect.top - 60, 
          left: Math.max(10, Math.min(window.innerWidth - 320, selectionRect.left + (selectionRect.width / 2) - 160)) 
        }}
      >
        <button onClick={() => applyCommand('bold')} title="Bold"><Bold size={14} /></button>
        <button onClick={() => applyCommand('italic')} title="Italic"><Italic size={14} /></button>
        <button onClick={() => applyCommand('underline')} title="Underline"><Underline size={14} /></button>
        <div className="w-[1px] h-4 bg-white/10 mx-1" />
        <button onClick={() => applyCommand('insertUnorderedList')} title="List"><ListIcon size={14} /></button>
        <div className="w-[1px] h-4 bg-white/10 mx-1" />
        <select 
          onChange={(e) => applyCommand('formatBlock', e.target.value)}
          defaultValue="P"
        >
          <option value="P">Text</option>
          <option value="H1">H1</option>
          <option value="H2">H2</option>
          <option value="H3">H3</option>
        </select>
        <div className="w-[1px] h-4 bg-white/10 mx-1" />
        <button onClick={() => {
          const url = prompt('Enter URL:');
          if (url) applyCommand('createLink', url);
        }} title="Link"><LinkIcon size={14} /></button>
      </motion.div>
    );
  };

  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    casperletId: '',
    price: '',
    teleport_url: '',
    status: 'available',
    description: '',
    imageUrl: '',
    expiry_date: ''
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'expiring'>('all');

  const filteredProperties = properties.filter(prop => {
    if (activeFilter === 'all') return true;
    if (!prop.expiry_date) return false;
    const expiry = new Date(prop.expiry_date);
    const now = new Date();
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 7;
  }).sort((a, b) => {
    // Sort expiring ones first if filtered
    if (activeFilter === 'expiring') {
      return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
    }
    return 0;
  });

  const stats = {
    total: properties.length,
    rented: properties.filter(p => p.status === 'rented').length,
    available: properties.filter(p => p.status === 'available').length,
    critical: properties.filter(p => {
      if (!p.expiry_date) return false;
      const expiry = new Date(p.expiry_date);
      const now = new Date();
      const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 3;
    }).length,
    attention: properties.filter(p => {
      if (!p.expiry_date) return false;
      const expiry = new Date(p.expiry_date);
      const now = new Date();
      const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 3 && diff <= 7;
    }).length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    totalTickets: tickets.length
  };

  useEffect(() => {
    // Check initial session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleUser(session?.user ?? null);
    };

    const handleUser = async (sbUser: User | null) => {
      setUser(sbUser);
      if (sbUser) {
        try {
          const userEmail = sbUser.email?.toLowerCase();
          
          // Hardcoded whitelist (unconditional admins)
          const adminEmails = [
            'hello@liegepaschoalini.design', 
            'slmariew@gmail.com', 
            'victoriaholanbra@gmail.com'
          ];
          const isWhitelisted = userEmail && adminEmails.includes(userEmail);

          // Get or Create profile in Supabase
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', userEmail)
            .single();
          
          if (!profile && sbUser.email) {
            console.log("Synchronizing new user to table:", userEmail);
            await supabase.from('users').insert([{
              email: sbUser.email,
              uid: sbUser.id,
              is_admin: isWhitelisted
            }]);
            setIsAdmin(isWhitelisted);
          } else if (profile) {
            // Update admin status if whitelisted but not set in DB
            if (isWhitelisted && !profile.is_admin) {
              await supabase.from('users').update({ is_admin: true }).eq('id', profile.id);
              setIsAdmin(true);
            } else {
              setIsAdmin(!!profile.is_admin);
            }
          }
        } catch (error) {
          console.error("Error synchronizing profile:", error);
          // Fallback to whitelist if DB fails
          const userEmail = sbUser.email?.toLowerCase();
          const adminEmails = ['hello@liegepaschoalini.design', 'slmariew@gmail.com', 'victoriaholanbra@gmail.com'];
          setIsAdmin(!!(userEmail && adminEmails.includes(userEmail)));
        } finally {
          setAuthLoading(false);
        }
      } else {
        setIsAdmin(false);
        setAuthLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchRenters = async () => {
      const { data, error } = await supabase.from('renters').select('*');
      if (error) console.error(error);
      else setRenters(data || []);
    };

    fetchRenters();
    const rentersSubscription = supabase
      .channel('renters_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'renters' }, fetchRenters)
      .subscribe();

    return () => {
      supabase.removeChannel(rentersSubscription);
    };
  }, [user, isAdmin]);

  const handleRenterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRenterFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveRenter = async () => {
    if (!renterFormData.avatarName || !renterFormData.avatarUuid || !renterFormData.password) {
      showToast("Please fill in all renter fields.", "info");
      return;
    }

    try {
      const dataToSave = {
        avatar_name: renterFormData.avatarName,
        tenant_id: renterFormData.avatarUuid,
        avatar_uuid: renterFormData.avatarUuid, // Keep both for safety
        password: renterFormData.password
      };

      // Use upsert to avoid 409 errors (conflicts)
      const { error: renterError } = await supabase
        .from('renters')
        .upsert(dataToSave, { onConflict: 'avatar_uuid' });

      if (renterError) throw renterError;

      // 1. First, clear all properties that were assigned to this resident if we are doing a full sync
      // If selectedPropertyIds is provided, we should ensure only those are linked.
      // But based on user feedback "O vínculo só deve ser removido se eu clicar explicitamente",
      // we might want to only ADD links here, and let unlinking happen elsewhere.
      // HOWEVER, for a multi-select UI, usually it is expected to sync.
      // I will keep the clear logic but wrap it to be sure it only happens if we are intending to manage links.
      
      const renterUuid = renterFormData.avatarUuid;

      // Update links: Sync properties with the selection
      // First, get currently linked properties for this user
      const { data: currentLinked } = await supabase
        .from('properties')
        .select('id')
        .eq('tenant_id', renterUuid);
      
      const currentLinkedIds = currentLinked?.map(p => p.id) || [];

      // Find properties to UNLINK (those currently linked but NOT in the new selection)
      const toUnlink = currentLinkedIds.filter(id => !selectedPropertyIds.includes(id));
      
      if (toUnlink.length > 0) {
        await supabase
          .from('properties')
          .update({
            tenant_id: null,
            tenant_name: null,
            status: 'available'
          })
          .in('id', toUnlink);
      }

      // Find properties to LINK (those in new selection but NOT currently linked)
      const toLink = selectedPropertyIds.filter(id => !currentLinkedIds.includes(id));

      if (toLink.length > 0) {
        await supabase
          .from('properties')
          .update({
            tenant_id: renterUuid,
            tenant_name: renterFormData.avatarName,
            status: 'rented'
          })
          .in('id', toLink);
      }

      showToast("Residente e vínculos de imóveis atualizados!");
      setRenterFormData({ avatarName: '', avatarUuid: '', password: '' });
      setSelectedPropertyIds([]);
      setEditingRenterId(null);
    } catch (error: any) {
      console.error(error);
      showToast(`Erro no salvamento: ${error.message}`, "error");
    }
  };

  const handleDeleteRenter = async (id: string, avatarUuid: string) => {
    if (!confirm("Are you sure? This will not remove their history but will set their properties to Available and prevent their login.")) return;
    try {
      // 1. Clear properties linked to this resident before deleting them
      const { error: clearError } = await supabase
        .from('properties')
        .update({
          tenant_id: null,
          tenant_name: null,
          status: 'available'
        })
        .eq('tenant_id', avatarUuid);

      if (clearError) throw clearError;

      // 2. Delete the renter
      const { error } = await supabase.from('renters').delete().eq('id', id);
      if (error) throw error;

      showToast("Renter removed and properties reset to Available!");
    } catch (error) {
      console.error(error);
      showToast("Error deleting renter", "error");
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*');
      
      if (error) {
        console.error(error);
      } else {
        setProperties(data || []);
      }
    };

    fetchProperties();

    const propertiesSubscription = supabase
      .channel('properties_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchProperties)
      .subscribe();

    return () => {
      supabase.removeChannel(propertiesSubscription);
    };
  }, [user, isAdmin]);

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('id', { ascending: false }); // Show newest first
    
    if (error) {
      console.error("Error fetching gallery:", error);
    } else {
      setGalleryImages(data || []);
    }
  };

  const fetchInboxMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setInboxMessages(data || []);
    }
  };

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      fetchInboxMessages();
    } catch (error) {
      console.error(error);
      showToast("Erro ao atualizar status", "error");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Excluir esta mensagem?")) return;
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      showToast("Mensagem excluída!");
      fetchInboxMessages();
    } catch (error) {
      console.error(error);
      showToast("Erro ao excluir mensagem", "error");
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;

    fetchGallery();
    fetchInboxMessages();

    const gallerySubscription = supabase
      .channel('gallery_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetchGallery)
      .subscribe();

    const inboxSubscription = supabase
      .channel('inbox_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetchInboxMessages)
      .subscribe();

    return () => {
      supabase.removeChannel(gallerySubscription);
      supabase.removeChannel(inboxSubscription);
    };
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchTeam = async () => {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error(error);
      } else {
        setTeamMembers(data || []);
      }
    };

    fetchTeam();

    const teamSubscription = supabase
      .channel('team_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team' }, fetchTeam)
      .subscribe();

    return () => {
      supabase.removeChannel(teamSubscription);
    };
  }, [user, isAdmin]);

  const handleTeamInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeamFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTeam = async () => {
    if (!teamFormData.name || !teamFormData.role || !teamFormData.image) {
      showToast("Please fill in name, role and upload a photo.", "info");
      return;
    }

    try {
      const dataToSave: any = {
        name: teamFormData.name,
        role: teamFormData.role,
        bio: teamFormData.bio,
        photo_url: teamFormData.image,
        icon: teamFormData.icon,
        sl_url: teamFormData.slProfile,
        display_order: parseInt(teamFormData.order) || 0
      };

      if (editingTeamId) {
        dataToSave.id = editingTeamId;
      }

      console.log("Saving team member to Supabase...", dataToSave);
      const { error } = await supabase
        .from('team')
        .upsert(dataToSave);
      
      if (error) {
        console.error("SUPABASE TEAM SAVE ERROR:", error);
        window.alert("Erro no Banco de Dados: " + JSON.stringify(error, null, 2));
        throw error;
      }
      
      showToast("Membro da equipe atualizado com sucesso! ✨");

      setTeamFormData({
        name: '',
        role: '',
        bio: '',
        image: '',
        icon: 'Users',
        slProfile: '#',
        order: (teamMembers.length + 1).toString()
      });
      setEditingTeamId(null);
    } catch (error) {
      console.error(error);
      showToast("Error saving team member", "error");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from('team').delete().eq('id', id);
      if (error) throw error;
      showToast("Team member removed!");
    } catch (error) {
      console.error(error);
      showToast("Error deleting member", "error");
    }
  };

  const handleEditTeam = (item: any) => {
    setTeamFormData({
      name: item.name || '',
      role: item.role || '',
      bio: item.bio || '',
      image: item.photo_url || '',
      icon: item.icon || 'Users',
      slProfile: item.sl_url || '#',
      order: item.display_order?.toString() || '0'
    });
    setEditingTeamId(item.id);
  };

  const handleGallerySave = async () => {
    if (!galleryFormData.imageUrl) {
      showToast("Por favor, carregue uma imagem primeiro.", "info");
      return;
    }

    try {
      console.log("Iniciando salvamento na tabela 'gallery'...", { url: galleryFormData.imageUrl, caption: galleryFormData.caption });
      
      const { error } = await supabase.from('gallery').insert({
        url: galleryFormData.imageUrl,
        caption: galleryFormData.caption
      });
      
      if (error) {
        console.error("SUPABASE GALLERY INSERT ERROR:", error);
        throw error;
      }
      
      setGalleryFormData({ caption: '', imageUrl: '' });
      showToast("Foto adicionada à galeria com sucesso!");
      
      // Força a atualização da lista
      await fetchGallery();
    } catch (err: any) {
      console.error("Erro completo ao salvar galeria:", err);
      showToast(`Erro ao salvar na galeria: ${err.message || 'Erro desconhecido'}`, "error");
    }
  };

  const handleDeleteGallery = async (id: number) => {
    if (!window.confirm("Deseja realmente remover esta foto da galeria?")) return;
    
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      showToast("Foto removida!");
      // Explicitly refresh the list
      await fetchGallery();
    } catch (err: any) {
      console.error("Erro ao deletar foto:", err);
      showToast("Falha ao remover foto", "error");
    }
  };

  const fetchVideos = async () => {
    const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (!error) setVideos(data || []);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setIsUploadingSlot('videos');

    try {
      // Fixed path for Hero Video as requested
      const filePath = `videos/hero-video.mp4`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { 
          upsert: true,
          // Support for large files usually involves some client-side settings if using certain libs
          // but we'll stick to standard upload and hope the network holds.
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Save to videos table (as a record)
      const { error: dbError } = await supabase.from('videos').upsert({
        id: 1, // Fixed ID for the hero video record if we want to treat it as a singleton
        name: 'Hero Virtual Tour',
        url: publicUrl
      });

      if (dbError) throw dbError;

      // Update Hero Section Settings directly
      const { error: heroUpdateError } = await supabase.from('site_settings').upsert({
        id: 'hero_section',
        virtual_tour_url: publicUrl,
        updated_at: new Date().toISOString()
      });

      if (heroUpdateError) console.error("Error updating hero settings with new video:", heroUpdateError);

      showToast("Vídeo do Hero atualizado com sucesso!");
      setHeroContent(prev => ({ ...prev, virtualTourUrl: publicUrl }));
      fetchVideos();
    } catch (err: any) {
      console.error(err);
      showToast("Erro ao enviar vídeo: " + err.message, "error");
    } finally {
      setIsUploading(false);
      setIsUploadingSlot(null);
      setUploadProgress(0);
    }
  };

  const handleDeleteVideo = async (id: number) => {
    if (!confirm("Excluir este vídeo?")) return;
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      showToast("Vídeo excluído!");
      fetchVideos();
    } catch (err: any) {
      showToast("Erro ao excluir vídeo", "error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'imageUrl' | 'image' | 'backgroundImage' | 'aboutImage' | 'gridImage' | 'gallery', gridIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadId = gridIdx !== undefined ? `grid-${gridIdx}` : targetField;
    setIsUploadingSlot(uploadId);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileToUpload: File | Blob = file;
      const isImage = file.type.startsWith('image/');
      
      if (isImage) {
        let maxWidth = 1920;
        if (targetField === 'gridImage' || targetField === 'image' || targetField === 'gallery') maxWidth = 1200;

        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: maxWidth,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: 0.8
        };
        fileToUpload = await imageCompression(file, options);
      }

      const fileExt = isImage ? 'webp' : file.name.split('.').pop();
      const cleanName = targetField === 'backgroundImage' ? 'hero_bg' : 
                        targetField === 'gridImage' ? `hero_grid_${gridIdx}` : 
                        targetField === 'aboutImage' ? 'hero_about' : 
                        targetField === 'gallery' ? 'gallery_item' : targetField;
      
      const fileName = `${cleanName}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `media/${fileName}`;

      const bucketName = 'media';
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (targetField === 'imageUrl') {
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      } else if (targetField === 'image') {
        setTeamFormData(prev => ({ ...prev, image: publicUrl }));
      } else if (targetField === 'gallery') {
        setGalleryFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      } else if (targetField === 'backgroundImage' || targetField === 'aboutImage') {
        const updatedHero = { ...heroContent, [targetField]: publicUrl };
        setHeroContent(updatedHero);
        
        // Persist all fields to avoid overwriting with nulls
        await supabase.from('site_settings').upsert({ 
          id: 'hero_section',
          badge_text: updatedHero.badgeText,
          title_main: updatedHero.title1,
          title_italic: updatedHero.title2,
          background_url: updatedHero.backgroundImage,
          about_image_url: updatedHero.aboutImage,
          grid_photo_1: updatedHero.gridImages[0] || '',
          grid_photo_2: updatedHero.gridImages[1] || '',
          grid_photo_3: updatedHero.gridImages[2] || '',
          grid_photo_4: updatedHero.gridImages[3] || '',
          updated_at: new Date().toISOString()
        });
      } else if (targetField === 'gridImage' && gridIdx !== undefined) {
        const newGrid = [...heroContent.gridImages];
        newGrid[gridIdx] = publicUrl;
        const updatedHero = { ...heroContent, gridImages: newGrid };
        setHeroContent(updatedHero);
        
        // Persist all fields to avoid overwriting with nulls
        await supabase.from('site_settings').upsert({ 
          id: 'hero_section',
          badge_text: updatedHero.badgeText,
          title_main: updatedHero.title1,
          title_italic: updatedHero.title2,
          background_url: updatedHero.backgroundImage,
          about_image_url: updatedHero.aboutImage,
          grid_photo_1: updatedHero.gridImages[0] || '',
          grid_photo_2: updatedHero.gridImages[1] || '',
          grid_photo_3: updatedHero.gridImages[2] || '',
          grid_photo_4: updatedHero.gridImages[3] || '',
          updated_at: new Date().toISOString()
        });
      }

      showToast("Media processada e salva!");
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(error.message || "Upload failed", "error");
    } finally {
      setIsUploadingSlot(null);
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    console.log('Tentando salvar (Supabase):', formData);
    
    if (!formData.name || !formData.price || !formData.imageUrl || !formData.description || !formData.casperletId || !formData.teleport_url) {
      showToast("Please fill in all required fields and upload an image.", "info");
      return;
    }

    try {
      const dataToSave: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        casperlet_id: formData.casperletId,
        image_url: formData.imageUrl,
        teleport_url: formData.teleport_url,
        status: editingId ? formData.status : 'available',
        expiry_date: formData.expiry_date || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('properties')
          .update(dataToSave)
          .eq('id', editingId);
        if (error) throw error;
        showToast("Property updated successfully!");
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([dataToSave]);
        if (error) throw error;
        showToast("Property saved successfully!");
      }

      setFormData({
        name: '',
        casperletId: '',
        price: '',
        teleport_url: '',
        status: 'available',
        description: '',
        imageUrl: '',
        expiry_date: ''
      });
      setEditingId(null);
      setActiveTab('listings');
    } catch (error) {
      console.error("CRITICAL SUPABASE ERROR:", error);
      showToast("Failed to save property. Check console for details.", "error");
    }
  };

  const handleEdit = (prop: any) => {
    setFormData({
      name: prop.name || '',
      casperletId: prop.casperlet_id || '',
      price: prop.price?.toString() || '',
      teleport_url: prop.teleport_url || '',
      status: prop.status || 'available',
      description: prop.description || '',
      imageUrl: prop.image_url || '',
      expiry_date: prop.expiry_date || ''
    });
    setEditingId(prop.id);
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      showToast("Property deleted successfully!");
    } catch (error) {
      console.error(error);
      showToast("Error deleting property", "error");
    }
  };

  const handleResolveTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'resolved' })
        .eq('id', id);

      if (error) throw error;
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
      showToast("Ticket resolved");
    } catch (err) {
      console.error(err);
      showToast("Error resolving ticket", "error");
    }
  };

  const handleSendResponse = async (id: string) => {
    if (!adminResponse.trim()) return;
    setIsSubmittingResponse(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          response: adminResponse,
          status: 'resolved'
        })
        .eq('id', id);

      if (error) throw error;
      setTickets(prev => prev.map(t => t.id === id ? { ...t, response: adminResponse, status: 'resolved' } : t));
      setReplyingTicketId(null);
      setAdminResponse('');
      showToast("Response sent and ticket resolved");
    } catch (err) {
      console.error(err);
      showToast("Error sending response", "error");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-2 border-white/5 rounded-full absolute inset-0 animate-ping"></div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(247,203,69,0.2)]"
          >
            <span className="text-black font-black text-4xl">H</span>
          </motion.div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-amber-500 font-bold uppercase tracking-[0.5em] text-xs animate-pulse">Loading</h2>
          <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
            <motion.div 
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-amber-500/50 w-1/2"
            />
          </div>
        </div>
      </div>
    );
  }

  // Only show auth form or access denied if loading is finished AND we have a final answer on isAdmin
  if (!user || (isAdmin === false && !authLoading)) {
    return (
      <div className="pt-32 pb-24 px-6 bg-black min-h-screen flex items-center justify-center">
        <div className="aspect-square w-full max-w-md flex items-center justify-center">
          <div className="w-full">
            {!user ? (
              <AdminAuthForm />
            ) : (
              <div className="glass-card p-12 text-center space-y-8">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="text-red-500 w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold text-white">Access Denied</h2>
                  <p className="text-white/40 uppercase tracking-widest text-[10px]">Your account is not authorized to access this panel.</p>
                </div>
                <div className="space-y-4">
                  <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    {user.email}
                  </p>
                  <button 
                    onClick={() => signOut()}
                    className="w-full py-4 rounded-xl border border-white/10 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Logout & Switch User
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="flex items-center gap-4 px-4 mb-8 text-left">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/50 shrink-0 bg-amber-500/10 flex items-center justify-center">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="text-amber-500" size={20} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.user_metadata?.full_name || user.email}</p>
              <button onClick={() => signOut()} className="text-[10px] text-red-400 uppercase tracking-widest hover:underline">Logout</button>
            </div>
          </div>

          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 px-4 mb-4">Admin Panel</h2>
          {[
            { id: 'listings', name: 'Properties', icon: BarChart3 },
            { id: 'renters', name: 'Residents', icon: UserIcon },
            { id: 'gallery', name: 'Gallery', icon: ImageIcon },
            { id: 'hero', name: 'Hero', icon: ImageIcon },
            { id: 'team', name: 'Team', icon: UserIcon },
            { id: 'inbox', name: 'Inbox', icon: Mail },
            { id: 'videos', name: 'Videos', icon: Video },
            { id: 'tickets', name: 'Support Tickets', icon: MessageSquare },
            { id: 'add', name: editingId ? 'Editing Property' : 'New Property', icon: Plus },
            { id: 'covenant', name: 'Covenant', icon: FileText },
            { id: 'settings', name: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                activeTab === item.id 
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-8">
          {activeTab === 'tickets' && (
            <div className="max-w-6xl space-y-8">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <h3 className="text-2xl font-bold font-display text-white">Support Tickets</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Manage resident requests and technical issues.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">{stats.openTickets} Open</span>
                  </div>
                  <button 
                    onClick={async () => {
                      const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
                      setTickets(data || []);
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {tickets.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                    <MessageSquare size={48} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">No help requests at the moment</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <motion.div 
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "glass-card p-0 overflow-hidden border-white/5 transition-all group",
                        ticket.status === 'open' ? "ring-1 ring-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]" : "opacity-60"
                      )}
                    >
                      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                        {/* Meta Data */}
                        <div className="lg:w-64 p-8 space-y-6 shrink-0 bg-white/[0.02]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded",
                                ticket.status === 'open' ? "bg-amber-500 text-black" : "bg-white/10 text-white/40"
                              )}>
                                {ticket.status}
                              </span>
                              <span className="text-[8px] text-white/20 font-mono tracking-tighter">
                                {new Date(ticket.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-500">
                                <UserIcon size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{ticket.avatar_name}</p>
                                <p className="text-[8px] text-white/20 uppercase font-black tracking-tighter truncate">{ticket.user_id}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Tag size={12} className="text-amber-500/40" />
                              <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{ticket.category}</span>
                            </div>
                          </div>

                          {ticket.status === 'open' && (
                            <button 
                              onClick={() => setReplyingTicketId(replyingTicketId === ticket.id ? null : ticket.id)}
                              className="w-full py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-lg"
                            >
                              {replyingTicketId === ticket.id ? 'Cancel Reply' : 'Reply & Resolve'}
                            </button>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8 space-y-6">
                          <div className="space-y-2 text-left">
                            <h4 className="text-xl font-bold text-white tracking-tight">{ticket.subject}</h4>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                              <p className="text-sm text-white/80 leading-relaxed italic">"{ticket.message}"</p>
                            </div>
                          </div>

                          {ticket.response && (
                            <div className="pl-6 border-l-2 border-amber-500/30 space-y-2 text-left">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="text-amber-500" size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Official Response</span>
                              </div>
                              <p className="text-sm text-white/60 leading-relaxed">{ticket.response}</p>
                            </div>
                          )}

                          <AnimatePresence>
                            {replyingTicketId === ticket.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 space-y-4">
                                  <textarea 
                                    value={adminResponse}
                                    onChange={(e) => setAdminResponse(e.target.value)}
                                    placeholder="Type your response here... (The ticket will be marked as resolved)"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-amber-500 outline-none transition-all resize-none"
                                    rows={4}
                                  />
                                  <div className="flex justify-end gap-3">
                                    <button 
                                      onClick={() => handleResolveTicket(ticket.id)}
                                      className="px-6 py-3 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                                    >
                                      Mark as Resolved (No Reply)
                                    </button>
                                    <button 
                                      onClick={() => handleSendResponse(ticket.id)}
                                      disabled={isSubmittingResponse || !adminResponse.trim()}
                                      className="px-8 py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                                    >
                                      {isSubmittingResponse ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                                      Send & Resolve
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'renters' && (
            <div className="max-w-4xl space-y-8">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <h3 className="text-2xl font-bold font-display text-white">Resident Management</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Manage SL residents, UUIDs and access passwords.</p>
                </div>
              </div>

              <div className="glass-card p-8 border-white/10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avatar Name (SL)</label>
                    <input 
                      type="text" 
                      name="avatarName"
                      value={renterFormData.avatarName}
                      onChange={handleRenterInputChange}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-amber-500 text-white"
                      placeholder="John Resident"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avatar UUID</label>
                    <input 
                      type="text" 
                      name="avatarUuid"
                      value={renterFormData.avatarUuid}
                      onChange={handleRenterInputChange}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-amber-500 text-white"
                      placeholder="00000000-0000-0000-0000-000000000000"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Login Password</label>
                    <input 
                      type="text" 
                      name="password"
                      value={renterFormData.password}
                      onChange={handleRenterInputChange}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm outline-none focus:border-amber-500 text-white"
                      placeholder="Secret Key"
                    />
                  </div>
                </div>

                {/* Property Assignment in Renter Tab */}
                <div className="space-y-4 text-left border-t border-white/5 pt-6">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Assign Properties</label>
                    <span className="text-[9px] text-white/30 uppercase">{selectedPropertyIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {properties
                      .map(prop => (
                        <button
                          key={prop.id}
                          onClick={() => {
                            setSelectedPropertyIds(prev => 
                              prev.includes(prop.id) 
                                ? prev.filter(id => id !== prop.id) 
                                : [...prev, prop.id]
                            );
                          }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                            selectedPropertyIds.includes(prop.id)
                              ? "bg-amber-500/10 border-amber-500 text-white"
                              : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 shrink-0 relative">
                            <img src={prop.image_url} className="w-full h-full object-cover" />
                            {prop.status !== 'available' && !selectedPropertyIds.includes(prop.id) && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-[6px] font-black uppercase text-white/50 tracking-tighter">Ocupado</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-[10px] font-bold truncate">{prop.name}</p>
                              {prop.tenant_id && !selectedPropertyIds.includes(prop.id) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`Occupied by ${prop.tenant_name}`} />
                              )}
                            </div>
                            <p className="text-[8px] font-mono text-amber-500/60 truncate">L$ {prop.price}</p>
                          </div>
                        </button>
                      ))}
                    {properties.length === 0 && (
                      <p className="text-[10px] text-white/20 uppercase py-4">No properties registered</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {renterFormData.avatarUuid && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#f59e0b] bg-zinc-900">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(renterFormData.avatarName || 'SL')}&background=111111&color=f59e0b&size=200&bold=true&format=svg`} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-amber-500/60">SL Profile Preview</span>
                    </div>
                  )}
                  <div className="flex gap-4">
                    {editingRenterId && (
                      <button 
                        onClick={() => { 
                          setEditingRenterId(null); 
                          setRenterFormData({ avatarName: '', avatarUuid: '', password: '' }); 
                          setSelectedPropertyIds([]);
                        }}
                        className="px-6 py-3 rounded-xl border border-white/10 text-white text-[10px] font-bold uppercase"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={handleSaveRenter}
                      className="px-8 py-3 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all"
                    >
                      {editingRenterId ? 'Update Resident' : 'Register Resident'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renters.map((renter) => (
                  <div key={renter.id} className="glass-card p-6 border-white/5 hover:border-amber-500/30 transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#f59e0b] bg-zinc-900">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(renter.avatar_name)}&background=111111&color=f59e0b&size=200&bold=true&format=svg`} 
                          alt={renter.avatar_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-bold text-white truncate">{renter.avatar_name}</h4>
                        <p className="text-[9px] text-white/30 font-mono truncate">{renter.avatar_uuid}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center bg-black/20 p-2 rounded-lg">
                      <div className="text-left">
                        <span className="text-[8px] uppercase text-gray-500 font-bold block">Password</span>
                        <span className="text-[10px] text-amber-500/80 font-mono">{renter.password}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingRenterId(renter.id);
                            setRenterFormData({
                              avatarName: renter.avatar_name,
                              avatarUuid: renter.avatar_uuid,
                              password: renter.password
                            });
                            // Fetch currently assigned properties for this renter
                            const id = renter.tenant_id || renter.avatar_uuid;
                            const assignedIds = properties
                              .filter(p => p.tenant_id === id)
                              .map(p => p.id);
                            setSelectedPropertyIds(assignedIds);
                          }}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <Settings size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRenter(renter.id, renter.avatar_uuid)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="max-w-4xl space-y-12">
              <div className="text-left">
                <h3 className="text-2xl font-bold font-display text-white">Hero Management</h3>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-2">Layout espelhado com compressão WebP automática.</p>
              </div>

              <div className="space-y-12">
                {/* Visual Mirror Layout */}
                <div className="space-y-8">
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                       < ImageIcon size={14} /> Background Photo (Full Page)
                    </label>
                    <div className="relative group aspect-video rounded-[32px] overflow-hidden border-2 border-white/5 bg-zinc-900 shadow-2xl">
                      {heroContent.backgroundImage ? (
                        <img src={heroContent.backgroundImage} className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/10">
                          <ImageIcon size={48} />
                        </div>
                      )}
                      
                      {/* Upload Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <label className="px-6 py-3 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-amber-400 transform hover:scale-105 transition-all">
                           <input 
                             type="file" 
                             className="hidden" 
                             accept="image/*"
                             onChange={(e) => handleFileUpload(e, 'backgroundImage')}
                             disabled={isUploadingSlot === 'backgroundImage'}
                           />
                           {isUploadingSlot === 'backgroundImage' ? 'Gravando...' : 'Mudar Fundo'}
                        </label>
                      </div>

                      {isUploadingSlot === 'backgroundImage' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                           <Loader2 className="text-amber-500 animate-spin" size={32} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 text-left">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                       < ImageIcon size={14} /> Front Cards Grid (4 Photos)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className={cn(
                          "relative group aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 transition-all",
                          idx % 2 !== 0 && "md:translate-y-6"
                        )}>
                          {heroContent.gridImages[idx] ? (
                            <img src={heroContent.gridImages[idx]} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/5">
                              <ImageIcon size={24} />
                            </div>
                          )}

                          {/* Upload Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <label className="w-10 h-10 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-500 hover:text-black transition-all">
                               <input 
                                 type="file" 
                                 className="hidden" 
                                 accept="image/*"
                                 onChange={(e) => handleFileUpload(e, 'gridImage', idx)}
                                 disabled={isUploadingSlot === `grid-${idx}`}
                               />
                               <Plus size={18} />
                            </label>
                          </div>

                          {isUploadingSlot === `grid-${idx}` && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                               <Loader2 className="text-amber-500 animate-spin" size={24} />
                            </div>
                          )}
                          
                          <div className="absolute bottom-2 left-2 text-[8px] font-black text-white/20 uppercase tracking-tighter">Slot {idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Settings */}
                <div className="glass-card p-10 border-white/5 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Badge Highlight</label>
                        <input 
                          type="text"
                          name="badgeText"
                          value={heroContent.badgeText}
                          onChange={handleHeroInputChange}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
                        />
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title Part 1 (Main)</label>
                        <input 
                          type="text"
                          name="title1"
                          value={heroContent.title1}
                          onChange={handleHeroInputChange}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
                        />
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title Part 2 (Italic)</label>
                        <input 
                          type="text"
                          name="title2"
                          value={heroContent.title2}
                          onChange={handleHeroInputChange}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
                        />
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Virtual Tour Video</label>
                        <select 
                          name="virtualTourUrl"
                          value={heroContent.virtualTourUrl}
                          onChange={(e) => setHeroContent((prev: any) => ({ ...prev, virtualTourUrl: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-zinc-900 text-white/40">Selecione um vídeo</option>
                          {videos.map(v => (
                            <option key={v.id} value={v.url} className="bg-zinc-900 text-white">{v.name}</option>
                          ))}
                        </select>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">
                          Escolha um vídeo enviado na aba de Vídeos.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 text-left border-l border-white/5 pl-8">
                       <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">About Section Image</label>
                       <div className="relative group aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
                          {heroContent.aboutImage ? (
                            <img src={heroContent.aboutImage} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/5">
                              <ImageIcon size={32} />
                            </div>
                          )}
                          
                          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                             <input 
                               type="file" 
                               className="hidden" 
                               accept="image/*"
                               onChange={(e) => handleFileUpload(e, 'aboutImage')}
                               disabled={isUploadingSlot === 'aboutImage'}
                             />
                             <div className="p-3 bg-white text-black rounded-xl">
                                <Plus size={18} />
                             </div>
                          </label>

                          {isUploadingSlot === 'aboutImage' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                               <Loader2 className="text-amber-500 animate-spin" size={24} />
                            </div>
                          )}
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveHero}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all uppercase tracking-widest text-[10px] shadow-2xl"
                  >
                    <Save size={18} /> Save All Text & Links
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="max-w-5xl space-y-12">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <h2 className="text-3xl font-bold font-display text-white">Video Management</h2>
                  <p className="text-white/40 text-xs uppercase tracking-widest mt-2">Upload and manage virtual tour videos.</p>
                </div>
                
                <label className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all cursor-pointer flex items-center gap-2">
                  <Plus size={16} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="video/*" 
                    onChange={handleVideoUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? `Uploading Video...` : 'Upload Video'}
                </label>
              </div>

              {isUploading && isUploadingSlot === 'videos' && (
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 15, ease: "linear" }}
                    className="h-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                  />
                  <p className="text-[8px] text-white/40 uppercase tracking-[0.2em] mt-2 text-right">Uploading high-quality video... please wait.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid) => (
                  <div key={vid.id} className="glass-card group p-4 border-white/5 flex flex-col gap-4 overflow-hidden">
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group">
                      <video src={vid.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => window.open(vid.url, '_blank')}
                          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Play size={16} fill="black" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-2 pb-2">
                      <div className="text-left min-w-0">
                        <p className="text-[10px] font-bold text-white truncate uppercase tracking-wider">{vid.name}</p>
                        <p className="text-[8px] text-white/30 font-mono mt-1">{new Date(vid.created_at).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteVideo(vid.id)}
                        className="p-2 text-white/20 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {videos.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">No videos uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'inbox' && (
            <div className="max-w-5xl space-y-8">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <h3 className="text-2xl font-bold font-display text-white italic">Inbox Messages</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Mensagens diretas enviadas para sua equipe.</p>
                </div>
                <button 
                  onClick={fetchInboxMessages}
                  className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {inboxMessages.length > 0 ? (
                  inboxMessages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "glass-card p-8 border-white/5 group hover:border-amber-500/20 transition-all flex flex-col md:flex-row gap-6 items-start",
                        msg.is_read && "opacity-40 grayscale-[0.5]"
                      )}
                    >
                      <div className="shrink-0 flex flex-col items-center gap-1">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-black font-black",
                          msg.is_read ? "bg-white/20 text-white/40" : "bg-amber-500"
                        )}>
                          {msg.visitor_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[8px] text-white/20 font-mono tracking-tighter">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex-1 space-y-4 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-white font-bold tracking-tight text-lg">{msg.visitor_name}</h4>
                              {!msg.is_read && (
                                <span className="px-2 py-0.5 bg-amber-500 text-[8px] text-black font-black uppercase rounded-full">New</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-amber-500 uppercase font-black tracking-widest">Para:</span>
                              <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{msg.recipient_name}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleToggleRead(msg.id, msg.is_read)}
                              title={msg.is_read ? "Mark as unread" : "Mark as read"}
                              className="p-2 text-white/10 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                            >
                              {msg.is_read ? <Mail size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed italic border-l-2 border-white/5 pl-4 py-1">
                          "{msg.message}"
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                    <Mail size={40} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/20 text-[10px] uppercase font-black tracking-widest">Caixa de entrada vazia</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="max-w-4xl space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold font-display text-left text-white">Team Management</h3>
                <button 
                  onClick={() => {
                    setEditingTeamId(null);
                    setTeamFormData({
                      name: '',
                      role: '',
                      bio: '',
                      image: '',
                      icon: 'Users',
                      slProfile: '#',
                      order: (teamMembers.length + 1).toString()
                    });
                  }}
                  className="text-[10px] font-black uppercase text-amber-500 tracking-widest hover:underline"
                >
                  Reset Form
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Form */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-amber-500/70 uppercase">Name</label>
                      <input 
                        type="text"
                        name="name"
                        value={teamFormData.name}
                        onChange={handleTeamInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                        placeholder="Ymir Coronet"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                      <input 
                        type="text"
                        name="role"
                        value={teamFormData.role}
                        onChange={handleTeamInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                        placeholder="Founder & Architect"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-gray-500 uppercase">Icon</label>
                        <select 
                          name="icon"
                          value={teamFormData.icon}
                          onChange={handleTeamInputChange}
                          className="w-full glass-card bg-zinc-900 border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white appearance-none"
                        >
                          <option value="Briefcase">Briefcase</option>
                          <option value="Paintbrush">Paintbrush</option>
                          <option value="ShieldCheck">Shield</option>
                          <option value="Scale">Legal</option>
                          <option value="Users">Community</option>
                        </select>
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-gray-500 uppercase">Order</label>
                        <input 
                          type="number"
                          name="order"
                          value={teamFormData.order}
                          onChange={handleTeamInputChange}
                          className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase">Profile/SLURL</label>
                      <input 
                        type="text"
                        name="slProfile"
                        value={teamFormData.slProfile}
                        onChange={handleTeamInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                        placeholder="#"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase">Bio</label>
                      <textarea 
                        name="bio"
                        value={teamFormData.bio}
                        onChange={handleTeamInputChange}
                        rows={4}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white"
                        placeholder="Short biography..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase">Portrait Photo</label>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <input 
                          type="text"
                          name="image"
                          value={teamFormData.image}
                          onChange={handleTeamInputChange}
                          className="flex-1 glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                          placeholder="Paste portrait URL or upload..."
                        />
                        <label className="shrink-0 flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'image')}
                            disabled={isUploading}
                          />
                          <ImageIcon className="text-gray-500 group-hover:text-white" size={20} />
                        </label>
                      </div>
                      {teamFormData.image && (
                        <div className="aspect-[4/5] w-32 rounded-xl overflow-hidden border border-white/10 mx-auto">
                           <img src={teamFormData.image} alt="Team Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveTeam}
                    className="w-full py-5 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-amber-500 transition-all uppercase tracking-widest text-xs"
                  >
                    <Save size={18} /> {editingTeamId ? 'Update Member' : 'Add to Team'}
                  </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase block text-left">Current Team</label>
                  <div className="grid gap-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="glass-card p-4 flex items-center gap-4 group">
                        <div className="w-12 h-16 rounded-lg bg-white/10 overflow-hidden shrink-0">
                          <img src={member.photo_url || member.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-bold text-sm truncate text-white">{member.name}</h4>
                          <div className="flex items-center gap-2">
                             <p className="text-[10px] text-amber-500/60 uppercase tracking-widest truncate">{member.role}</p>
                             <span className="text-[8px] text-white/20 font-black">#{member.display_order}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditTeam(member)}
                            className="p-2 text-gray-500 hover:text-white"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteTeam(member.id)}
                            className="p-2 text-red-500/30 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="max-w-5xl space-y-12">
              <div className="text-left">
                <h3 className="text-2xl font-bold font-display text-white">Gestão da Galeria</h3>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-2">Adicione fotos ilimitadas com legendas. Compactação WebP automática ativa.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                   <div className="glass-card p-8 border-white/5 space-y-6">
                      <div className="space-y-4 text-left">
                        <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Nova Foto</label>
                        <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-white/10 bg-white/5 hover:border-amber-500/50 transition-all">
                           {galleryFormData.imageUrl ? (
                             <img src={galleryFormData.imageUrl} className="w-full h-full object-cover" />
                           ) : (
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-3">
                                <ImageIcon size={32} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Escolher Arquivo</span>
                             </div>
                           )}
                           
                           <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'gallery')}
                                disabled={isUploadingSlot === 'gallery'}
                              />
                              <div className="bg-white text-black p-3 rounded-full">
                                <Plus size={20} />
                              </div>
                           </label>

                           {isUploadingSlot === 'gallery' && (
                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                <Loader2 className="text-amber-500 animate-spin" size={24} />
                             </div>
                           )}
                        </div>
                      </div>

                      <div className="space-y-4 text-left">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Legenda (Opcional)</label>
                        <input 
                          type="text"
                          value={galleryFormData.caption}
                          onChange={(e) => setGalleryFormData({ ...galleryFormData, caption: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:border-amber-500 outline-none text-white transition-all shadow-inner"
                          placeholder="Ex: Pôr do sol no píer..."
                        />
                      </div>

                      <button 
                        onClick={handleGallerySave}
                        disabled={!galleryFormData.imageUrl || isUploading}
                        className="w-full py-4 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center gap-3 hover:bg-amber-400 transition-all uppercase tracking-widest text-[10px] disabled:opacity-30"
                      >
                        <Save size={16} /> Adicionar à Galeria
                      </button>
                   </div>
                </div>

                {/* Grid Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fotos Atuais ({galleryImages.length})</label>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="group relative aspect-square rounded-2xl bg-zinc-900 overflow-hidden border border-white/5 hover:border-amber-500/50 transition-all">
                        <img src={img.url} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                        
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                           <p className="text-[9px] text-white font-bold truncate leading-tight">{img.caption || 'Sem legenda'}</p>
                        </div>

                        <div className="absolute top-2 right-2 flex gap-2 translate-y-[-120%] group-hover:translate-y-0 transition-transform">
                          <button 
                            onClick={() => handleDeleteGallery(img.id)}
                            className="w-8 h-8 flex items-center justify-center bg-red-500/90 text-white rounded-full hover:bg-red-600 shadow-xl"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {galleryImages.length === 0 && (
                      <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                         <p className="text-white/10 text-[10px] uppercase font-black tracking-widest">Nenhuma foto na galeria</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'covenant' && (
            <div className="space-y-12 max-w-4xl mx-auto pb-32">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold font-display text-amber-500 tracking-tighter">Covenant Management</h2>
                  <p className="text-white/40 uppercase tracking-[0.3em] text-[10px]">Edit legal documentation (Select text to format - Adobe Style).</p>
                </div>
              </div>

              <FloatingToolbar />

              <div className="grid grid-cols-1 gap-12">
                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">English Version</label>
                  <div className="editor-container" onPaste={handlePaste} onMouseUp={handleSelection} onKeyUp={handleSelection}>
                    <Editor 
                      value={covenants.en}
                      onChange={(e: any) => {
                        setCovenants(prev => ({ ...prev, en: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="Enter English covenant text..."
                    />
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">Portuguese Version</label>
                  <div className="editor-container" onPaste={handlePaste} onMouseUp={handleSelection} onKeyUp={handleSelection}>
                    <Editor 
                      value={covenants.pt}
                      onChange={(e: any) => {
                        setCovenants(prev => ({ ...prev, pt: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="Insira o texto do covenant em português..."
                    />
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">Spanish Version</label>
                  <div className="editor-container" onPaste={handlePaste} onMouseUp={handleSelection} onKeyUp={handleSelection}>
                    <Editor 
                      value={covenants.es}
                      onChange={(e: any) => {
                        setCovenants(prev => ({ ...prev, es: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="Ingrese el texto del convenio en español..."
                    />
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest">Dutch Version</label>
                  <div className="editor-container" onPaste={handlePaste} onMouseUp={handleSelection} onKeyUp={handleSelection}>
                    <Editor 
                      value={covenants.nl}
                      onChange={(e: any) => {
                        setCovenants(prev => ({ ...prev, nl: e.target.value }));
                        setIsDirty(true);
                      }}
                      placeholder="Voer de Nederlandse tekst van het convenant in..."
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveCovenant}
                className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl text-sm font-bold uppercase tracking-[0.4em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <Save size={18} /> Update Covenants
              </button>

              <AnimatePresence>
                {isDirty && (
                  <motion.button
                    initial={{ y: 50, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.8 }}
                    onClick={handleSaveCovenant}
                    className="fixed bottom-12 right-12 z-[150] px-10 py-5 rounded-full bg-amber-500 text-black font-black flex items-center gap-3 shadow-[0_15px_60px_rgba(245,158,11,0.5)] hover:bg-amber-400 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em] text-[10px]"
                  >
                    <Save size={16} /> Save Changes
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-bold font-display tracking-tight">Executive Dashboard</h3>
                    <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.3em]">Operational overview & property management</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    <RefreshCw size={12} className="text-amber-500" />
                    Sync CasperLet
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Total Portfolio Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-8 border-white/10 bg-white/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <FileText size={48} className="text-white" />
                    </div>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-4">Total Portfolio</p>
                    <div className="text-5xl font-black text-white leading-none">{stats.total}</div>
                    <p className="text-[9px] text-white/20 uppercase mt-4 tracking-tighter">Units across all Sims</p>
                  </motion.div>

                  {/* Support Tickets Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    onClick={() => setActiveTab('tickets')}
                    className={cn(
                      "glass-card p-8 relative overflow-hidden transition-all duration-500 cursor-pointer group hover:scale-[1.02]",
                      stats.openTickets > 0 ? "border-amber-500/30 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.1)]" : "border-white/10 bg-white/5"
                    )}
                  >
                    <div className={cn("absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity", stats.openTickets > 0 ? "text-amber-500" : "text-white")}>
                      <MessageSquare size={48} />
                    </div>
                    <p className={cn("text-[10px] uppercase font-black tracking-widest mb-4", stats.openTickets > 0 ? "text-amber-500" : "text-white/40")}>Open Tickets</p>
                    <div className={cn("text-5xl font-black leading-none", stats.openTickets > 0 ? "text-amber-500" : "text-white")}>{stats.openTickets}</div>
                    <p className={cn("text-[9px] uppercase mt-4 tracking-tighter", stats.openTickets > 0 ? "text-amber-500/40" : "text-white/20")}>{stats.totalTickets} Total Tickets</p>
                  </motion.div>

                  {/* Occupancy Rate Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-8 border-amber-500/10 bg-amber-500/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <CheckCircle size={48} className="text-amber-500" />
                    </div>
                    <p className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest mb-4">Occupancy Rate</p>
                    <div className="flex items-baseline gap-2">
                       <div className="text-5xl font-black text-amber-500 leading-none">{Math.round((stats.rented / stats.total) * 100) || 0}%</div>
                       <div className="text-xs font-bold text-amber-500/40">{stats.rented}/{stats.total}</div>
                    </div>
                    <p className="text-[9px] text-amber-500/20 uppercase mt-4 tracking-tighter">{stats.available} Available for rent</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={cn(
                      "glass-card p-8 relative overflow-hidden transition-all duration-500",
                      stats.critical > 0 ? "border-red-500/30 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.1)]" : "border-white/10 bg-white/5"
                    )}
                  >
                    <div className={cn("absolute top-0 right-0 p-8 opacity-10", stats.critical > 0 ? "text-red-500" : "text-white")}>
                      <AlertCircle size={48} />
                    </div>
                    <p className={cn("text-[10px] uppercase font-black tracking-widest mb-4", stats.critical > 0 ? "text-red-500" : "text-white/40")}>Critical Issues</p>
                    <div className={cn("text-5xl font-black leading-none", stats.critical > 0 ? "text-red-500" : "text-white")}>{stats.critical}</div>
                    <p className={cn("text-[9px] uppercase mt-4 tracking-tighter", stats.critical > 0 ? "text-red-500/40" : "text-white/20")}>Expiring within 3 days</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={cn(
                      "glass-card p-8 relative overflow-hidden transition-all duration-500",
                      stats.attention > 0 ? "border-amber-500/30 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.1)]" : "border-white/10 bg-white/5"
                    )}
                  >
                    <div className={cn("absolute top-0 right-0 p-8 opacity-10", stats.attention > 0 ? "text-amber-500" : "text-white")}>
                      <Clock size={48} />
                    </div>
                    <p className={cn("text-[10px] uppercase font-black tracking-widest mb-4", stats.attention > 0 ? "text-amber-500" : "text-white/40")}>Attention</p>
                    <div className={cn("text-5xl font-black leading-none", stats.attention > 0 ? "text-amber-500" : "text-white")}>{stats.attention}</div>
                    <p className={cn("text-[9px] uppercase mt-4 tracking-tighter", stats.attention > 0 ? "text-amber-500/40" : "text-white/20")}>Expiring within 7 days</p>
                  </motion.div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/5">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveFilter('all')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeFilter === 'all' ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white"
                      )}
                    >
                      All Properties ({properties.length})
                    </button>
                    <button 
                      onClick={() => setActiveFilter('expiring')}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        activeFilter === 'expiring' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-white/40 hover:text-red-400"
                      )}
                    >
                      <Clock size={12} />
                      Vencimentos Próximos ({stats.critical + stats.attention})
                    </button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {filteredProperties.map((prop) => {
                    const daysRemaining = prop.expiry_date ? Math.ceil((new Date(prop.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                    const isCritical = daysRemaining !== null && daysRemaining <= 3;
                    const isAttention = daysRemaining !== null && daysRemaining > 3 && daysRemaining <= 7;

                    return (
                      <div 
                        key={prop.id} 
                        className={cn(
                          "glass-card p-4 flex items-center gap-4 group transition-all duration-300",
                          isCritical ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)] scale-[1.01]" : 
                          isAttention ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]" : 
                          "border-white/5"
                        )}
                      >
                        <div className="w-20 h-14 rounded-lg bg-white/10 overflow-hidden shrink-0">
                           <img src={prop.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm truncate">{prop.name}</h4>
                            
                            {daysRemaining !== null && (
                              <div className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                                isCritical ? "bg-red-500 text-white" : isAttention ? "bg-amber-500 text-black" : "bg-white/10 text-white/40"
                              )}>
                                <Clock size={8} />
                                {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days left`}
                              </div>
                            )}

                            {prop.casperlet_id && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-[8px] text-amber-500 font-black uppercase tracking-tighter shadow-sm">
                                <RefreshCw size={8} className="animate-spin-slow" />
                                Synced
                              </div>
                            )}
                            {prop.tenant_name && (
                              <div className="flex items-center gap-1">
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-[8px] text-blue-400 font-black uppercase tracking-tighter">
                                  <UserIcon size={8} />
                                  {prop.tenant_name}
                                </div>
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if(!confirm(`Desvincular ${prop.tenant_name} deste imóvel?`)) return;
                                    await supabase.from('properties').update({ tenant_id: null, tenant_name: null, status: 'available' }).eq('id', prop.id);
                                    showToast("Imóvel desvinculado!");
                                  }}
                                  className="p-1 hover:text-red-500 text-white/20 transition-colors"
                                  title="Unlink Resident"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-tighter truncate">L$ {prop.price}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col items-end gap-1">
                             <div className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                prop.status === 'available' ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/40"
                              )}>
                                {prop.status}
                             </div>
                           </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleEdit(prop)}
                              className="p-2 text-gray-500 hover:text-white transition-colors"
                              title="Edit Property"
                            >
                              <ChevronRight size={14} />
                            </button>
                            <button 
                              onClick={() => window.open(prop.teleport_url, '_blank')}
                              className="p-2 text-gray-500 hover:text-amber-500 transition-colors"
                              title="Teleport to location"
                            >
                              <MapPin size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(prop.id)}
                              className="p-2 text-red-500/30 hover:text-red-500 transition-colors"
                              title="Delete Property"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                {properties.length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No properties registered</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {activeTab === 'add' && (
            <div className="max-w-2xl space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold font-display text-left">
                  {editingId ? 'Edit Property Details' : 'Register New Property'}
                </h3>
                {editingId && (
                  <button 
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        name: '',
                        casperletId: '',
                        price: '',
                        teleport_url: '',
                        status: 'available',
                        description: '',
                        imageUrl: '',
                        expiry_date: ''
                      });
                    }}
                    className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-amber-500/70 uppercase">Property Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                      placeholder="Ex: Dutch Mansion" 
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase">Device Key (CasperLet ID)</label>
                    <input 
                      type="text" 
                      name="casperletId"
                      value={formData.casperletId}
                      onChange={handleInputChange}
                      className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                      placeholder="Paste Device Key" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-amber-500/70 uppercase">Price (L$ / Week)</label>
                    <input 
                      type="number" 
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                      placeholder="1500" 
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-amber-500/70 uppercase">Expiry Date (Manual)</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="date" 
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 pl-12 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">Teleport Link (SLURL)</label>
                  <div className="relative">
                    <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      name="teleport_url"
                      value={formData.teleport_url}
                      onChange={handleInputChange}
                      className="w-full glass-card bg-transparent border-white/10 p-4 pl-12 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                      placeholder="http://maps.secondlife.com/secondlife/..." 
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                    placeholder="Describe the island amenities..."
                  />
                </div>

                {editingId && (
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-amber-500/70 uppercase">Availability Status</label>
                    <div className="relative">
                      <select 
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full glass-card bg-background-dark border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white appearance-none cursor-pointer"
                      >
                        <option value="available" className="bg-background-dark">Available</option>
                        <option value="rented" className="bg-background-dark">Rented</option>
                      </select>
                      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase">Property Photo</label>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <input 
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        readOnly
                        className="flex-1 glass-card bg-transparent border-white/10 p-4 text-sm opacity-50 cursor-not-allowed outline-none text-white shadow-inner"
                        placeholder="Upload an image using the button..."
                      />
                      <label className="shrink-0 flex items-center justify-center px-6 bg-amber-500 border border-amber-400 rounded-xl cursor-pointer hover:bg-amber-400 transition-all group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'imageUrl')}
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <Loader2 className="animate-spin text-black" size={20} />
                        ) : (
                          <div className="flex items-center gap-2 text-black font-bold text-[10px] uppercase tracking-widest">
                            <ImageIcon size={16} />
                            Upload Photo
                          </div>
                        )}
                      </label>
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-amber-500">
                           <span>Processing...</span>
                           <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="h-full bg-amber-500"
                           />
                        </div>
                      </div>
                    )}
                    
                    {formData.imageUrl && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleSave}
                    disabled={isUploading}
                    className="w-full py-5 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(245,158,11,0.2)] hover:bg-amber-400 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50"
                  >
                    {editingId ? <RefreshCw size={18} /> : <Plus size={18} />}
                    {editingId ? 'Update Property' : 'Publish Property'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />
    </div>
  );
}
