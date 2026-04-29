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
  FileText,
  Clock,
  Calendar,
  CreditCard,
  User as UserIcon,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db, loginWithEmail, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy,
  getDoc,
  setDoc
} from 'firebase/firestore';

function AdminAuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { signInWithGoogle } = await import('../lib/firebase');
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google login failed:", err);
      let msg = err.message || 'Login failed';
      if (err.code === 'auth/popup-blocked') {
        msg = "The login popup was blocked by your browser. Please allow popups for this site.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        msg = "Login process was cancelled.";
      } else if (err.code === 'auth/api-key-not-valid') {
        msg = "Invalid API Key. Please verify the Firebase configuration.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center space-y-6">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
          <LogIn className="text-amber-500" size={32} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-white font-bold uppercase tracking-widest text-sm">Secure Access</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">
            Use your professional Google account to access the administrative panel.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed">{error}</p>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-white text-black font-black flex items-center justify-center gap-3 hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
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
      
      <p className="text-center text-[10px] text-white/20 uppercase tracking-widest font-medium">
        Authorized emails only: <br/> slmariew@gmail.com | liegepaschoalini.design
      </p>
    </div>
  );
}

export default function AdminArea() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'add' | 'settings' | 'covenant' | 'gallery' | 'team' | 'hero'>('listings');
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
  const [isHeroUploading, setIsHeroUploading] = useState<number | 'bg' | 'about' | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [galleryFormData, setGalleryFormData] = useState({ caption: '' });
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [isTeamUploading, setIsTeamUploading] = useState(false);
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
    
    // Fetch Covenants
    const unsubscribeCovenant = onSnapshot(doc(db, 'settings', 'covenant'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCovenants({
          en: data.en || '',
          pt: data.pt || '',
          es: data.es || '',
          nl: data.nl || ''
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/covenant');
    });

    // Fetch Hero Content
    const unsubscribeHero = onSnapshot(doc(db, 'settings', 'hero'), (docSnap) => {
      if (docSnap.exists()) {
        setHeroContent(docSnap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/hero');
    });

    return () => {
      unsubscribeCovenant();
      unsubscribeHero();
    };
  }, [user, isAdmin]);

  const handleHeroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeroContent((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number | 'bg' | 'about') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHeroUploading(index);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      
      setHeroContent((prev: any) => {
        if (index === 'bg') {
          return { ...prev, backgroundImage: data.url };
        } else if (index === 'about') {
          return { ...prev, aboutImage: data.url };
        } else {
          const newGrid = [...prev.gridImages];
          newGrid[index] = data.url;
          return { ...prev, gridImages: newGrid };
        }
      });
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsHeroUploading(null);
    }
  };

  const handleSaveHero = async () => {
    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'settings', 'hero'), {
        ...heroContent,
        updatedAt: serverTimestamp()
      });
      alert("Hero content updated successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/hero');
    }
  };

  const handleSaveCovenant = async () => {
    try {
      // Need setDoc because it might be the first time creation
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'settings', 'covenant'), {
        ...covenants,
        updatedAt: serverTimestamp()
      });
      alert("Covenants updated successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/covenant');
    }
  };
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedType, setUploadedType] = useState<'image' | 'video' | ''>('');
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    casperletId: '',
    price: '',
    slurl: '',
    status: 'available',
    description: '',
    bedrooms: '',
    bathrooms: '',
    location: 'Holanbra',
    tenantName: '',
    tenantPassword: '',
    nextPayment: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed - User:", user?.email);
      setUser(user);
      if (user) {
        try {
          const userEmail = user.email?.toLowerCase();
          console.log("Verifying admin status for:", userEmail);

          // Hardcoded whitelist (unconditional admins)
          const adminEmails = [
            'hello@liegepaschoalini.design', 
            'slmariew@gmail.com', 
            'victoriaholanbra@gmail.com'
          ];
          const isWhitelisted = userEmail && adminEmails.includes(userEmail);

          // Sync profile to Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists() && isWhitelisted) {
            console.log("Creating initial admin profile for whitelisted user");
            await setDoc(userDocRef, {
              email: user.email,
              uid: user.uid,
              role: 'admin',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          }

          const hasAdminRole = userDoc.exists() && userDoc.data()?.role === 'admin';

          // Final decision
          const finalIsAdmin = !!isWhitelisted || hasAdminRole;
          console.log("Admin verification result:", { isWhitelisted, hasAdminRole, finalIsAdmin });
          
          setIsAdmin(finalIsAdmin);
        } catch (error: any) {
          console.error("Error checking admin status:", error.code, error.message);
          // If Firestore check fails, still allow if whitelisted
          const userEmail = user.email?.toLowerCase();
          const whitelist = ['hello@liegepaschoalini.design', 'slmariew@gmail.com', 'victoriaholanbra@gmail.com'];
          setIsAdmin(!!(userEmail && whitelist.includes(userEmail)));
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const propertyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProperties(propertyList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGalleryImages(imgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gallery');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(collection(db, 'team'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'team');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const handleTeamInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeamFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTeamUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      setTeamFormData(prev => ({ ...prev, image: data.url }));
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsTeamUploading(false);
    }
  };

  const handleSaveTeam = async () => {
    if (!teamFormData.name || !teamFormData.role || !teamFormData.image) {
      alert("Please fill in name, role and upload a photo.");
      return;
    }

    try {
      const dataToSave = {
        ...teamFormData,
        order: parseInt(teamFormData.order),
        updatedAt: serverTimestamp()
      };

      if (editingTeamId) {
        await updateDoc(doc(db, 'team', editingTeamId), dataToSave);
        alert("Team member updated!");
      } else {
        await addDoc(collection(db, 'team'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        alert("Team member added!");
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
      handleFirestoreError(error, editingTeamId ? OperationType.UPDATE : OperationType.CREATE, 'team');
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, 'team', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `team/${id}`);
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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGalleryUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      
      await addDoc(collection(db, 'gallery'), {
        url: data.url,
        caption: galleryFormData.caption,
        createdAt: serverTimestamp()
      });
      
      setGalleryFormData({ caption: '' });
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const limit = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > limit) {
      alert(`File too large. The limit for ${isVideo ? 'video' : 'image'} is ${isVideo ? '50MB' : '5MB'}.`);
      return;
    }

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      setUploadedUrl(data.url);
      setUploadedType(data.format === 'video' ? 'video' : 'image');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !uploadedUrl) {
      alert("Please fill in name, price, and upload an image.");
      return;
    }

    try {
      const dataToSave: any = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        image: uploadedUrl,
        gallery: [{ type: uploadedType || 'image', url: uploadedUrl }],
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'properties', editingId), dataToSave);
        alert("Property updated successfully!");
      } else {
        dataToSave.createdAt = serverTimestamp();
        await addDoc(collection(db, 'properties'), dataToSave);
        alert("Property saved successfully!");
      }

      setFormData({
        name: '',
        casperletId: '',
        price: '',
        slurl: '',
        status: 'available',
        description: '',
        bedrooms: '',
        bathrooms: '',
        location: 'Holanbra',
        tenantName: '',
        tenantPassword: '',
        nextPayment: ''
      });
      setUploadedUrl('');
      setEditingId(null);
      setActiveTab('listings');
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'properties');
    }
  };

  const handleEdit = (prop: any) => {
    setFormData({
      name: prop.name || '',
      casperletId: prop.casperletId || '',
      price: prop.price?.toString() || '',
      slurl: prop.slurl || '',
      status: prop.status || 'available',
      description: prop.description || '',
      bedrooms: prop.bedrooms?.toString() || '',
      bathrooms: prop.bathrooms?.toString() || '',
      location: prop.location || 'Holanbra',
      tenantName: prop.tenantName || '',
      tenantPassword: prop.tenantPassword || '',
      nextPayment: prop.nextPayment || ''
    });
    setUploadedUrl(prop.image || '');
    setUploadedType(prop.gallery?.[0]?.type || 'image');
    setEditingId(prop.id);
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await deleteDoc(doc(db, 'properties', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `properties/${id}`);
    }
  };

  if (authLoading) {
    return (
      <div className="pt-32 pb-24 px-6 bg-black min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="pt-32 pb-24 px-6 bg-black min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full glass-card p-12 text-center space-y-8">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
            <LogIn className="text-amber-500 w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold text-white">Administrative Area</h2>
            <p className="text-white/40 uppercase tracking-widest text-xs">Restricted access for Holanbra administrators only.</p>
          </div>
          {!user ? (
            <AdminAuthForm />
          ) : (
            <div className="space-y-4">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertCircle size={14} /> You do not have administrator permissions.
              </p>
              <button 
                onClick={() => signOut(auth)}
                className="w-full py-4 rounded-xl border border-white/10 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
              >
                Logout
              </button>
            </div>
          )}
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
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="text-amber-500" size={20} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.displayName || user.email}</p>
              <button onClick={() => signOut(auth)} className="text-[10px] text-red-400 uppercase tracking-widest hover:underline">Logout</button>
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
                    <label className="block border-2 border-dashed border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer relative overflow-hidden aspect-video">
                      {isHeroUploading === 'bg' ? (
                        <Loader2 className="animate-spin text-amber-500" size={32} />
                      ) : heroContent.backgroundImage ? (
                        <img src={heroContent.backgroundImage} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <>
                          <ImageIcon size={32} className="mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Upload BG Image</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleHeroUpload(e, 'bg')} className="hidden" />
                    </label>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase">About Us Photo</label>
                    <label className="block border-2 border-dashed border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer relative overflow-hidden aspect-[4/5]">
                      {isHeroUploading === 'about' ? (
                        <Loader2 className="animate-spin text-amber-500" size={32} />
                      ) : heroContent.aboutImage ? (
                        <img src={heroContent.aboutImage} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <>
                          <ImageIcon size={32} className="mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Upload About Us Image</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleHeroUpload(e, 'about')} className="hidden" />
                    </label>
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
                      <label key={idx} className="block border-2 border-dashed border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer relative overflow-hidden aspect-square">
                        {isHeroUploading === idx ? (
                          <Loader2 className="animate-spin text-amber-500" size={24} />
                        ) : heroContent.gridImages[idx] ? (
                          <img src={heroContent.gridImages[idx]} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <>
                            <ImageIcon size={20} className="mb-1" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">Photo {idx + 1}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleHeroUpload(e, idx)} className="hidden" />
                      </label>
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
                    <label className="block border-2 border-dashed border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer relative overflow-hidden aspect-[4/5]">
                      {isTeamUploading ? (
                        <Loader2 className="animate-spin text-amber-500" size={32} />
                      ) : teamFormData.image ? (
                        <img src={teamFormData.image} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <>
                          <UserIcon size={32} className="mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-center">Portrait Upload<br/>(4:5 Ratio recommended)</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleTeamFileUpload} className="hidden" disabled={isTeamUploading} />
                    </label>
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

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase">Upload to Gallery</label>
                    <label className="block border-2 border-dashed border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer relative overflow-hidden">
                      {isGalleryUploading ? (
                        <Loader2 className="animate-spin text-amber-500" size={32} />
                      ) : (
                        <>
                          <ImageIcon size={32} className="mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Click or drag to upload photo</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleGalleryUpload} 
                        className="hidden" 
                        disabled={isGalleryUploading}
                      />
                    </label>
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
                       <img src={prop.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm truncate">{prop.name}</h4>
                        {prop.casperletId && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-[8px] text-amber-500 font-black uppercase tracking-tighter shadow-sm">
                            <RefreshCw size={8} className="animate-spin-slow" />
                            Synced
                          </div>
                        )}
                        {prop.tenantName && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-[8px] text-blue-400 font-black uppercase tracking-tighter">
                            <UserIcon size={8} />
                            {prop.tenantName}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-tighter truncate">{prop.location} / L$ {prop.price}</p>
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
                          onClick={() => window.open(prop.slurl, '_blank')}
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
                        slurl: '',
                        status: 'available',
                        description: '',
                        bedrooms: '',
                        bathrooms: '',
                        location: 'Holambra',
                        tenantName: '',
                        tenantPassword: '',
                        nextPayment: ''
                      });
                      setUploadedUrl('');
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
                    <label className="text-xs font-bold text-gray-500 uppercase">CasperLet ID</label>
                    <input 
                      type="text" 
                      name="casperletId"
                      value={formData.casperletId}
                      onChange={handleInputChange}
                      className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                      placeholder="Device Key" 
                    />
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">Financial Information & Location</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Price (L$ / Week)</label>
                      <input 
                        type="number" 
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white" 
                        placeholder="1500" 
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">SLURL (Location)</label>
                      <div className="relative">
                        <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text" 
                          name="slurl"
                          value={formData.slurl}
                          onChange={handleInputChange}
                          className="w-full glass-card bg-transparent border-white/10 p-4 pl-12 text-sm focus:border-amber-500 outline-none text-white" 
                          placeholder="secondlife://Holidays/128/128/22" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">Resident Access (Optional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase">SL Name</label>
                       <input 
                        type="text"
                        name="tenantName"
                        value={formData.tenantName}
                        onChange={handleInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white"
                        placeholder="Resident Name"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase">Access Password</label>
                       <input 
                        type="text"
                        name="tenantPassword"
                        value={formData.tenantPassword}
                        onChange={handleInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white"
                        placeholder="Secret Key"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase">Next Payment Due</label>
                       <input 
                        type="date"
                        name="nextPayment"
                        value={formData.nextPayment}
                        onChange={handleInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">Current Availability</label>
                  <div className="relative">
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full glass-card bg-background-dark border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white appearance-none cursor-pointer"
                    >
                      <option value="available" className="bg-background-dark">Available</option>
                      <option value="rented" className="bg-background-dark">Rented</option>
                      <option value="reserved" className="bg-background-dark">Reserved</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <label className="text-xs font-bold text-amber-500/70 uppercase">Property Details</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase">Bedrooms</label>
                       <input 
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase">Bathrooms</label>
                       <input 
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase">Upload Photos/Videos (WebP/MP4 Auto)</label>
                  <label className="block border-2 border-dashed border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-500 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer relative overflow-hidden">
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                    {uploadedUrl ? (
                      uploadedType === 'video' ? (
                        <video src={uploadedUrl} className="absolute inset-0 w-full h-full object-cover" muted loop autoPlay />
                      ) : (
                        <img src={uploadedUrl} className="absolute inset-0 w-full h-full object-cover" />
                      )
                    ) : (
                      <>
                        <div className="flex gap-4 mb-4">
                          <ImageIcon size={40} className={cn(isUploading && !uploadedUrl ? "animate-bounce text-amber-400" : "text-amber-500")} />
                          <Video size={40} className={cn(isUploading && !uploadedUrl ? "animate-bounce text-amber-400" : "text-amber-500")} />
                        </div>
                        <p className="text-sm font-medium text-white mb-1">
                          {isUploading ? 'Processing file...' : 'Drag photos or videos here'}
                        </p>
                        <p className="text-xs">WebP for photos | MP4 for videos</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4} 
                    className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white" 
                    placeholder="Property details..." 
                  />
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full py-5 rounded-2xl bg-amber-600 text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 hover:bg-amber-500 transition-all uppercase tracking-widest text-xs"
                >
                  <Save size={18} /> {editingId ? 'Update Property' : 'Save Property to Catalog'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
