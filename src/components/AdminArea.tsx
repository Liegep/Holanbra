import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  User as UserIcon,
  ArrowUpRight
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
  const [activeTab, setActiveTab] = useState<'listings' | 'add' | 'settings' | 'covenant' | 'gallery' | 'team' | 'hero'>('listings');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [covenants, setCovenants] = useState({ en: '', pt: '', es: '', nl: '' });
  const [heroContent, setHeroContent] = useState<any>({
    backgroundImage: '',
    badgeText: 'New Islands Available',
    title1: 'Holanbra',
    title2: 'Sims',
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
    
    const fetchData = async () => {
      // Fetch Covenants
      const { data: covenantData } = await supabase.from('settings').select('*').eq('id', 'covenant').single();
      if (covenantData) {
        setCovenants({
          en: covenantData.en || '',
          pt: covenantData.pt || '',
          es: covenantData.es || '',
          nl: covenantData.nl || ''
        });
      }

      // Fetch Hero Content
      const { data: heroData } = await supabase.from('settings').select('*').eq('id', 'hero').single();
      if (heroData) {
        setHeroContent(heroData.content);
      }
    };

    fetchData();

    // Subscribe to changes for real-time
    const settingsSubscription = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchData)
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
      const { error } = await supabase.from('settings').upsert({
        id: 'hero',
        content: heroContent
      });
      
      if (error) throw error;
      showToast("Hero content updated successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to update hero content", "error");
    }
  };

  const handleSaveCovenant = async () => {
    try {
      const { error } = await supabase.from('settings').upsert({
        id: 'covenant',
        ...covenants
      });
      
      if (error) throw error;
      showToast("Covenants updated successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to update covenants", "error");
    }
  };
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    casperletId: '',
    price: '',
    teleport_url: '',
    status: 'available',
    description: '',
    imageUrl: ''
  });

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

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*');
      
      if (error) {
        console.error(error);
      } else {
        setGalleryImages(data || []);
      }
    };

    fetchGallery();

    const gallerySubscription = supabase
      .channel('gallery_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetchGallery)
      .subscribe();

    return () => {
      supabase.removeChannel(gallerySubscription);
    };
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchTeam = async () => {
      const { data, error } = await supabase
        .from('team')
        .select('*');
      
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
      const dataToSave = {
        name: teamFormData.name,
        role: teamFormData.role,
        bio: teamFormData.bio,
        image: teamFormData.image,
        icon: teamFormData.icon,
        sl_profile: teamFormData.slProfile
      };

      if (editingTeamId) {
        const { error } = await supabase
          .from('team')
          .update(dataToSave)
          .eq('id', editingTeamId);
        if (error) throw error;
        showToast("Team member updated!");
      } else {
        const { error } = await supabase
          .from('team')
          .insert([dataToSave]);
        if (error) throw error;
        showToast("Team member added!");
      }

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
      image: item.image || '',
      icon: item.icon || 'Users',
      slProfile: item.slProfile || '#',
      order: item.order?.toString() || '0'
    });
    setEditingTeamId(item.id);
  };

  const handleGallerySave = async () => {
    if (!galleryFormData.imageUrl) {
      showToast("Please provide an image URL.", "info");
      return;
    }

    try {
      const { error } = await supabase.from('gallery').insert([{
        url: galleryFormData.imageUrl,
        caption: galleryFormData.caption
      }]);
      
      if (error) throw error;
      
      setGalleryFormData({ caption: '', imageUrl: '' });
      showToast("Gallery image saved!");
    } catch (err: any) {
      console.error(err);
      showToast("Gallery save failed", "error");
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      showToast("Image removed from gallery!");
    } catch (error) {
      console.error(error);
      showToast("Error deleting image", "error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'imageUrl' | 'image' | 'backgroundImage' | 'aboutImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileToUpload: File | Blob = file;
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (isImage) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: 0.8
        };
        fileToUpload = await imageCompression(file, options);
      }

      const fileExt = isImage ? 'webp' : file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${targetField}/${fileName}`;

      // Use the requested bucket 'media'
      const bucketName = 'media';
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        if (error.message.includes('bucket not found')) {
            throw new Error(`Supabase Storage bucket '${bucketName}' not found. Please create it in your Supabase dashboard.`);
        }
        throw error;
      }

      setUploadProgress(100);

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (targetField === 'imageUrl') {
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      } else if (targetField === 'image') {
        setTeamFormData(prev => ({ ...prev, image: publicUrl }));
      } else if (targetField === 'backgroundImage' || targetField === 'aboutImage') {
        setHeroContent((prev: any) => ({ ...prev, [targetField]: publicUrl }));
      }

      showToast("Media uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(error.message || "Upload failed", "error");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleSave = async () => {
    console.log('Tentando salvar (Supabase):', formData);
    
    if (!formData.name || !formData.price || !formData.imageUrl || !formData.description || !formData.casperletId || !formData.teleport_url) {
      showToast("Please fill in all required fields and upload an image.", "info");
      return;
    }

    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        casperlet_id: formData.casperletId,
        image_url: formData.imageUrl,
        teleport_url: formData.teleport_url,
        status: editingId ? formData.status : 'available'
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
        imageUrl: ''
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
      imageUrl: prop.image_url || ''
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
            { id: 'gallery', name: 'Gallery', icon: ImageIcon },
            { id: 'hero', name: 'Hero', icon: ImageIcon },
            { id: 'team', name: 'Team', icon: UserIcon },
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
          {activeTab === 'hero' && (
            <div className="max-w-4xl space-y-8">
              <h3 className="text-2xl font-bold font-display text-left text-white">Hero Management</h3>
              <p className="text-white/40 text-xs uppercase tracking-widest text-left">Manage images and text for the main entrance of your site.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Text Settings */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-amber-500/70 uppercase">Badge Text</label>
                      <input 
                        type="text"
                        name="badgeText"
                        value={heroContent.badgeText}
                        onChange={handleHeroInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase">Title 1 (Main)</label>
                      <input 
                        type="text"
                        name="title1"
                        value={heroContent.title1}
                        onChange={handleHeroInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase">Title 2 (Italic)</label>
                      <input 
                        type="text"
                        name="title2"
                        value={heroContent.title2}
                        onChange={handleHeroInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase">Background Image</label>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <input 
                          type="text"
                          name="backgroundImage"
                          value={heroContent.backgroundImage}
                          onChange={handleHeroInputChange}
                          className="flex-1 glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                          placeholder="Background URL..."
                        />
                        <label className="shrink-0 flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'backgroundImage')}
                            disabled={isUploading}
                          />
                          <ImageIcon className="text-gray-500 group-hover:text-white" size={20} />
                        </label>
                      </div>
                      {heroContent.backgroundImage && (
                        <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                          <img src={heroContent.backgroundImage} alt="BG Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase">About Us Photo</label>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <input 
                          type="text"
                          name="aboutImage"
                          value={heroContent.aboutImage}
                          onChange={handleHeroInputChange}
                          className="flex-1 glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                          placeholder="About Image URL..."
                        />
                        <label className="shrink-0 flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'aboutImage')}
                            disabled={isUploading}
                          />
                          <ImageIcon className="text-gray-500 group-hover:text-white" size={20} />
                        </label>
                      </div>
                      {heroContent.aboutImage && (
                        <div className="aspect-[4/5] w-32 rounded-xl overflow-hidden border border-white/10 mx-auto">
                          <img src={heroContent.aboutImage} alt="About Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveHero}
                    className="w-full py-5 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-amber-500 transition-all uppercase tracking-widest text-xs"
                  >
                    <Save size={18} /> Update Hero Content
                  </button>
                </div>

                {/* Grid Images */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase block text-left">Hero Grid Photos (4)</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className="space-y-2">
                        <input 
                          type="text"
                          value={heroContent.gridImages[idx]}
                          onChange={(e) => handleHeroGridChange(idx, e.target.value)}
                          className="w-full glass-card bg-transparent border-white/10 p-2 text-[10px] focus:border-amber-500 outline-none text-white shadow-inner"
                          placeholder={`Grid Photo ${idx + 1}`}
                        />
                        <div className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden relative">
                          {heroContent.gridImages[idx] ? (
                            <img src={heroContent.gridImages[idx]} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/10">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                          <img src={member.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-bold text-sm truncate text-white">{member.name}</h4>
                          <p className="text-[10px] text-amber-500/60 uppercase tracking-widest truncate">{member.role}</p>
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
            <div className="max-w-4xl space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold font-display text-left text-white">Sim Gallery</h3>
                <p className="text-white/40 text-xs uppercase tracking-widest text-left">Upload photos of the islands to show in the gallery.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4 text-left">
                    <label className="text-xs font-bold text-amber-500/70 uppercase">New Photo Caption (Optional)</label>
                    <input 
                      type="text"
                      value={galleryFormData.caption}
                      onChange={(e) => setGalleryFormData({ ...galleryFormData, caption: e.target.value })}
                      className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                      placeholder="e.g. Sunset at Holanbra North"
                    />
                  </div>

                  <div className="space-y-4 text-left">
                    <label className="text-xs font-bold text-amber-500/70 uppercase">Image URL</label>
                    <input 
                      type="text"
                      value={galleryFormData.imageUrl}
                      onChange={(e) => setGalleryFormData({ ...galleryFormData, imageUrl: e.target.value })}
                      className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                      placeholder="Paste image URL here..."
                    />
                    
                    {galleryFormData.imageUrl && (
                      <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                        <img src={galleryFormData.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <button 
                      onClick={handleGallerySave}
                      className="w-full py-5 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-amber-500 transition-all uppercase tracking-widest text-xs"
                    >
                      <Save size={18} /> Save to Gallery
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase block text-left">Existing Photos</label>
                  <div className="grid grid-cols-2 gap-4">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="relative aspect-video rounded-xl bg-white/5 overflow-hidden group">
                        <img src={img.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => handleDeleteGallery(img.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'covenant' && (
            <div className="max-w-4xl space-y-8">
              <h3 className="text-2xl font-bold font-display text-left text-white">Manage Covenant</h3>
              <p className="text-white/40 text-xs uppercase tracking-widest text-left">Set the rules and terms for your residents in multiple languages.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">English Version</label>
                  <textarea 
                    value={covenants.en}
                    onChange={(e) => setCovenants({ ...covenants, en: e.target.value })}
                    rows={10}
                    className="w-full glass-card bg-transparent border-white/10 p-6 text-sm focus:border-amber-500 outline-none text-white leading-relaxed"
                    placeholder="Enter English covenant text..."
                  />
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">Portuguese Version</label>
                  <textarea 
                    value={covenants.pt}
                    onChange={(e) => setCovenants({ ...covenants, pt: e.target.value })}
                    rows={10}
                    className="w-full glass-card bg-transparent border-white/10 p-6 text-sm focus:border-amber-500 outline-none text-white leading-relaxed"
                    placeholder="Insira o texto do covenant em português..."
                  />
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">Spanish Version</label>
                  <textarea 
                    value={covenants.es}
                    onChange={(e) => setCovenants({ ...covenants, es: e.target.value })}
                    rows={10}
                    className="w-full glass-card bg-transparent border-white/10 p-6 text-sm focus:border-amber-500 outline-none text-white leading-relaxed"
                    placeholder="Ingrese el texto del convenio en español..."
                  />
                </div>
                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">Dutch Version</label>
                  <textarea 
                    value={covenants.nl}
                    onChange={(e) => setCovenants({ ...covenants, nl: e.target.value })}
                    rows={10}
                    className="w-full glass-card bg-transparent border-white/10 p-6 text-sm focus:border-amber-500 outline-none text-white leading-relaxed"
                    placeholder="Voer de Nederlandse tekst van het convenant in..."
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveCovenant}
                className="px-12 py-5 rounded-2xl bg-amber-600 text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 hover:bg-amber-500 transition-all uppercase tracking-widest text-xs"
              >
                <Save size={18} /> Update Covenants
              </button>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold font-display">Manage Properties</h3>
                <button className="text-xs text-amber-400 hover:underline">Sync CasperLet</button>
              </div>
              
              <div className="grid gap-4">
                {properties.map((prop) => (
                  <div key={prop.id} className="glass-card p-4 flex items-center gap-4 group">
                    <div className="w-20 h-14 rounded-lg bg-white/10 overflow-hidden shrink-0">
                       <img src={prop.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm truncate">{prop.name}</h4>
                        {prop.casperlet_id && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-[8px] text-amber-500 font-black uppercase tracking-tighter shadow-sm">
                            <RefreshCw size={8} className="animate-spin-slow" />
                            Synced
                          </div>
                        )}
                        {prop.tenant_name && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-[8px] text-blue-400 font-black uppercase tracking-tighter">
                            <UserIcon size={8} />
                            {prop.tenant_name}
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
                ))}
                
                {properties.length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No properties registered</p>
                  </div>
                )}
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
                        imageUrl: ''
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
