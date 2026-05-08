import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Settings, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon, 
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Mail,
  MessageSquare,
  FileText,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase, signOut } from '../lib/supabase';
import { cn } from '../lib/utils';
import Toast, { ToastType } from './Toast';
import { User } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

// Sub-components
import { AdminAuthForm } from './admin/AdminAuthForm';
import { GridStatus } from './GridStatus';
import { AdminSupportTickets } from './admin/AdminSupportTickets';
import { AdminResidents } from './admin/AdminResidents';
import { AdminHeroSection } from './admin/AdminHeroSection';
import { AdminGalleryManager } from './admin/AdminGalleryManager';
import { AdminInbox } from './admin/AdminInbox';
import { AdminTeamManager } from './admin/AdminTeamManager';
import { AdminLandCovenant } from './admin/AdminLandCovenant';
import { AdminPropertyForm } from './admin/AdminPropertyForm';
import { AdminPropertyListings } from './admin/AdminPropertyListings';
import { AdminPortfolioManager } from './admin/AdminPortfolioManager';
import { AdminPricingManager } from './admin/AdminPricingManager';

export default function AdminArea() {
  const { t } = useTranslation();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'listings' | 'renters' | 'add' | 'covenant' | 'gallery' | 'team' | 'hero' | 'inbox' | 'tickets' | 'portfolio' | 'pricing'>('listings');
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingSlot, setIsUploadingSlot] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Data State
  const [properties, setProperties] = useState<any[]>([]);
  const [renters, setRenters] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [allPropertyTenants, setAllPropertyTenants] = useState<any[]>([]);
  const [selectedDescriptionLang, setSelectedDescriptionLang] = useState('en');
  const [heroContent, setHeroContent] = useState<any>({
    backgroundImage: '',
    badgeText: 'New Islands Available',
    title1: 'Holanbra',
    title2: 'Sims',
    virtualTourUrl: '',
    gridImages: ['', '', '', ''],
    aboutImage: ''
  });
  const [covenants, setCovenants] = useState({ en: '', pt: '', es: '', nl: '' });
  const [isDirty, setIsDirty] = useState(false);

  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRenterId, setEditingRenterId] = useState<string | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'expiring'>('all');
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    casperletId: '',
    price: '',
    rental_price: '',
    teleport_url: '',
    status: 'available',
    description: '',
    description_pt: '',
    description_nl: '',
    description_es: '',
    imageUrl: '',
    gallery_image_1: '',
    gallery_image_2: '',
    expiry_date: '',
    tenant_name: '',
    tenant_id: '',
    property_type: [] as string[],
    videoUrl: '',
    prims_allowed: '',
    perks: [] as string[]
  });

  const [renterFormData, setRenterFormData] = useState({
    avatarName: '',
    avatarUuid: '',
    password: ''
  });

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

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  // Auth Handling
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleUser(session?.user ?? null);
    };

    const handleUser = async (sbUser: User | null) => {
      setUser(sbUser);
      if (sbUser) {
        try {
          const userEmail = sbUser.email?.toLowerCase();
          const adminEmails = [
            'hello@liegepaschoalini.design', 
            'slmariew@gmail.com', 
            'victoriaholanbra@gmail.com'
          ];
          const isWhitelisted = userEmail && adminEmails.includes(userEmail);
          setIsAdmin(isWhitelisted || !!sbUser.app_metadata?.is_admin);
        } catch (error) {
          console.error("Error checking profile:", error);
          setIsAdmin(false);
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

  // Data Fetching
  const fetchTickets = async () => {
    try {
      setTickets([]); // Clear state before update
      const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      console.log('Tickets loaded from DB:');
      console.table(data);
      
      // Explicit mapping of IDs
      const mappedData = data?.map(ticket => ({
        ...ticket,
        id: ticket.id.toString() // Ensuring string format
      })) || [];
      
      setTickets(mappedData);
    } catch (err) {
      console.error("Fetch tickets error:", err);
    }
  };

  const fetchRenters = async () => {
    try {
      setRenters([]); // Clear state before update
      const { data, error } = await supabase.from('renters').select('avatar_name,avatar_uuid,password');
      if (error) throw error;

      console.log('Residents loaded from DB (Table: renters):');
      console.table(data);

      const mappedData = data?.map(renter => ({
        ...renter,
        id: renter.avatar_uuid // Using UUID as the primary react key
      })) || [];

      setRenters(mappedData);
    } catch (err) {
      console.error("Fetch residents error:", err);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase.from('properties').select('*');
      if (error) throw error;
      
      const mapped = (data || []).map(p => ({
        ...p,
        name: p.name || `Unit ${p.casperlet_id || p.id}`
      }));
      
      setProperties(mapped);
    } catch (err) {
      console.error("Fetch properties error:", err);
    }
  };

  const fetchGallery = async () => {
    try {
      const { data, error } = await supabase.from('gallery').select('*').order('id', { ascending: false });
      if (error) throw error;
      setGalleryImages(data || []);
    } catch (err) {
      console.error("Fetch gallery error:", err);
    }
  };

  const fetchInboxMessages = async () => {
    try {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      console.log('Messages loaded from DB (contact_messages):');
      console.table(data);

      // Explicit mapping of IDs
      const mappedData = data?.map(msg => ({
        ...msg,
        id: msg.id.toString() // Ensuring string format
      })) || [];
      
      setInboxMessages(mappedData);
    } catch (err) {
      console.error("Fetch inbox error:", err);
    }
  };


  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase.from('team').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (err) {
      console.error("Fetch team error:", err);
    }
  };

  const fetchPropertyTenants = async () => {
    try {
      const { data, error } = await supabase.from('property_tenants').select('*');
      if (error) throw error;
      setAllPropertyTenants(data || []);
    } catch (err) {
      console.error("Fetch property_tenants error:", err);
    }
  };

  const fetchData = async () => {
    if (!user || !isAdmin) return;

    // Fetch Covenants
    const { data: covenantData } = await supabase.from('land_covenants').select('*').limit(1).maybeSingle();
    if (covenantData) {
      setCovenants({
        en: covenantData.content_en || '',
        pt: covenantData.content_pt || '',
        es: covenantData.content_es || '',
        nl: covenantData.content_nl || ''
      });
    }

    // Fetch Hero
    const { data: heroData } = await supabase.from('site_settings').select('*').eq('id', 'hero_section').maybeSingle();
    if (heroData) {
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

    fetchProperties();
    fetchRenters();
    fetchGallery();
    fetchInboxMessages();
    fetchTeam();
    fetchTickets();
    fetchPropertyTenants();
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
      
      const channel = supabase.channel('admin_realtime_main')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'land_covenants' }, fetchData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, fetchTickets)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchProperties)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'renters' }, fetchRenters)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetchInboxMessages)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'property_tenants' }, fetchPropertyTenants)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isAdmin]);

  // Handlers
  const handleSaveHero = async () => {
    try {
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
      if (error) throw error;
      showToast("Settings saved successfully");
    } catch (error: any) {
      showToast("Save failed: " + error.message, "error");
    }
  };

  const handleSaveCovenant = async () => {
    try {
      const { data: existing } = await supabase.from('land_covenants').select('id').limit(1).maybeSingle();
      const payload: any = {
        content_en: covenants.en,
        content_pt: covenants.pt,
        content_es: covenants.es,
        content_nl: covenants.nl,
      };
      if (existing?.id) payload.id = existing.id;
      const { error } = await supabase.from('land_covenants').upsert(payload);
      if (error) throw error;
      setIsDirty(false);
      showToast("Covenant updated successfully");
    } catch (error) {
      showToast("Error updating covenant", "error");
    }
  };

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // Optimistic update
      setInboxMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, is_read: newStatus } : msg
      ));

      // Handle numeric IDs if necessary
      const numId = parseInt(id);
      const queryId = (!isNaN(numId) && numId.toString() === id) ? numId : id;

      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: newStatus })
        .eq('id', queryId);
      
      if (error) {
        // Rollback on error
        setInboxMessages(prev => prev.map(msg => 
          msg.id === id ? { ...msg, is_read: currentStatus } : msg
        ));
        throw error;
      }
      
      showToast(newStatus ? "Message marked as read" : "Message marked as unread");
    } catch (error: any) {
      console.error("Error updating message status:", error);
      alert("Erro no Supabase: " + error.message);
      showToast("Status update error", "error");
      fetchInboxMessages();
    }
  };

  const handleDeleteMessage = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!id) return;
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      // Handle numeric IDs if necessary
      const numId = parseInt(id);
      const queryId = (!isNaN(numId) && numId.toString() === id) ? numId : id;

      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', queryId);
      
      if (error) {
        console.error('Supabase Delete Error (contact_messages):', error);
        alert('Erro no Supabase: ' + error.message);
        return;
      }
      
      setInboxMessages(prev => prev.filter(m => m.id !== id));
      showToast("Message deleted successfully");
    } catch (error: any) {
      console.error('Unexpected error deleting message:', error);
      alert("Unexpected Error: " + error.message);
      showToast("Delete message error: " + error.message, "error");
      fetchInboxMessages();
    }
  };

  const handleSaveTeam = async () => {
    if (!teamFormData.name || !teamFormData.role || !teamFormData.image) {
      showToast("Please fill all required fields", "info");
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
      if (editingTeamId) dataToSave.id = editingTeamId;
      const { error } = await supabase.from('team').upsert(dataToSave);
      if (error) throw error;
      showToast("Team member updated successfully");
      setTeamFormData({ name: '', role: '', bio: '', image: '', icon: 'Users', slProfile: '#', order: (teamMembers.length + 1).toString() });
      setEditingTeamId(null);
      fetchTeam();
    } catch (error) {
      showToast("Error saving team member", "error");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const { error } = await supabase.from('team').delete().eq('id', id);
      if (error) throw error;
      setTeamMembers(prev => prev.filter(t => t.id !== id));
      showToast("Deleted successfully");
    } catch (error) {
      showToast("Delete error", "error");
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
      showToast("Please choose a photo first", "info");
      return;
    }
    try {
      const { error } = await supabase.from('gallery').insert({ url: galleryFormData.imageUrl, caption: galleryFormData.caption });
      if (error) throw error;
      setGalleryFormData({ caption: '', imageUrl: '' });
      showToast("Saved successfully");
      fetchGallery();
    } catch (err: any) {
      showToast("Save error", "error");
    }
  };

  const handleDeleteGallery = async (id: number) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      setGalleryImages(prev => prev.filter(img => img.id !== id));
      showToast("Deleted successfully");
    } catch (err: any) {
      showToast("Delete error", "error");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string, gridIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      showToast("File is too large (max 10MB)", "error");
      return;
    }
    
    const uploadId = gridIdx !== undefined ? `grid-${gridIdx}` : targetField;
    setIsUploadingSlot(uploadId);
    setIsUploading(true);
    setUploadProgress(0);
    try {
      let fileToUpload: File | Blob = file;
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type === 'video/mp4';
      
      if (isImage) {
        const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp', initialQuality: 0.8 };
        fileToUpload = await imageCompression(file, options);
      } else if (!isVideo) {
          throw new Error("Unsupported file type");
      }
      
      const fileExt = isImage ? 'webp' : file.name.split('.').pop();
      const fileName = `${targetField}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `media/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, fileToUpload, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

      if (targetField === 'imageUrl') setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      else if (targetField === 'gallery_image_1') setFormData(prev => ({ ...prev, gallery_image_1: publicUrl }));
      else if (targetField === 'gallery_image_2') setFormData(prev => ({ ...prev, gallery_image_2: publicUrl }));
      else if (targetField === 'videoUrl') setFormData(prev => ({ ...prev, videoUrl: publicUrl }));
      else if (targetField === 'image') setTeamFormData(prev => ({ ...prev, image: publicUrl }));
      else if (targetField === 'gallery') setGalleryFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      else if (targetField === 'backgroundImage' || targetField === 'aboutImage' || targetField === 'virtualTourUrl') {
        const updatedHero = { ...heroContent, [targetField]: publicUrl };
        setHeroContent(updatedHero);
        await supabase.from('site_settings').upsert({ 
          id: 'hero_section',
          badge_text: updatedHero.badgeText,
          title_main: updatedHero.title1,
          title_italic: updatedHero.title2,
          background_url: updatedHero.backgroundImage,
          about_image_url: updatedHero.aboutImage,
          virtual_tour_url: updatedHero.virtualTourUrl,
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
      showToast("Media processed successfully");
    } catch (error: any) {
      showToast(error.message || "Upload failed", "error");
    } finally {
      setIsUploadingSlot(null);
      setIsUploading(false);
    }
  };

  const handleSaveProperty = async () => {
    console.log("Dados ao salvar:", formData);
    
    // Validation
    const name = formData.name || '';
    if (!name || !formData.price || !formData.imageUrl) {
      showToast("Name, Price and Image URL are mandatory", "info");
      return;
    }

    setIsUploading(true);
    try {
      const dataToSave = {
        name: formData.name?.trim() || null,
        description: formData.description?.trim() || null,
        description_pt: formData.description_pt?.trim() || null,
        description_nl: formData.description_nl?.trim() || null,
        description_es: formData.description_es?.trim() || null,
        price: parseFloat(formData.price) || 0,
        rental_price: parseFloat(formData.rental_price) || parseFloat(formData.price) || 0,
        casperlet_id: formData.casperletId?.trim() || null,
        image_url: formData.imageUrl?.trim() || null, 
        gallery_image_1: formData.gallery_image_1?.trim() || null,
        gallery_image_2: formData.gallery_image_2?.trim() || null,
        video_url: formData.videoUrl?.trim() || null,
        teleport_url: formData.teleport_url?.trim() || null,
        status: formData.status || 'available',
        tenant_name: formData.tenant_name?.trim() || null,
        tenant_id: formData.tenant_id?.trim() || null,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        property_type: formData.property_type || [],
        prims_allowed: parseInt(formData.prims_allowed) || 0,
        perks: formData.perks || []
      };

      console.log("Saving property to 'properties':", dataToSave);

      let response;
      if (editingId) {
        response = await supabase.from('properties').update(dataToSave).eq('id', editingId);
      } else {
        response = await supabase.from('properties').insert([dataToSave]);
      }

      if (response.error) {
        console.error("Supabase Save Error:", response.error);
        if (response.error.message.includes('column') && response.error.message.includes('does not exist')) {
          alert(`ERRO DE SCHEMA: A coluna "${response.error.message.match(/"([^"]+)"/)?.[1]}" está faltando na tabela "properties".\n\nPor favor, garanta que a coluna "name" exista.`);
        } else {
          alert(`Erro no banco: ${response.error.message}`);
        }
        throw response.error;
      }

      showToast(editingId ? "Property updated" : "Property created", "success");
      
      setFormData({ 
        name: '',
        casperletId: '', 
        price: '', 
        rental_price: '', 
        teleport_url: '', 
        status: 'available', 
        description: '',
        description_pt: '',
        description_nl: '',
        description_es: '', 
        imageUrl: '',
        gallery_image_1: '',
        gallery_image_2: '',
        videoUrl: '',
        expiry_date: '',
        tenant_name: '',
        tenant_id: '',
        property_type: [],
        prims_allowed: '',
        perks: []
      });
      setEditingId(null);
      setActiveTab('listings');
      fetchProperties();
    } catch (err: any) {
      console.error("Save property catch:", err);
      showToast("Error saving property", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProperty = (prop: any) => {
    setFormData({
      name: prop.name || '',
      casperletId: prop.casperlet_id || '',
      price: prop.price?.toString() || '',
      rental_price: prop.rental_price?.toString() || '',
      teleport_url: prop.teleport_url || '',
      status: prop.status || 'available',
      description: prop.description || '',
      description_pt: prop.description_pt || '',
      description_nl: prop.description_nl || '',
      description_es: prop.description_es || '',
      imageUrl: prop.image_url || '',
      gallery_image_1: prop.gallery_image_1 || '',
      gallery_image_2: prop.gallery_image_2 || '',
      videoUrl: prop.video_url || '',
      expiry_date: prop.expiry_date || '',
      tenant_name: prop.tenant_name || '',
      tenant_id: prop.tenant_id || '',
      property_type: prop.property_type || [],
      prims_allowed: prop.prims_allowed?.toString() || '',
      perks: prop.perks || []
    });
    setEditingId(prop.id);
    setActiveTab('add');
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      setProperties(prev => prev.filter(p => p.id !== id));
      showToast("Deleted successfully");
    } catch (error) {
      showToast("Delete error", "error");
    }
  };

  const handleSaveRenter = async () => {
    if (!renterFormData.avatarName || !renterFormData.avatarUuid || !renterFormData.password) {
      showToast("Please fill all fields", "info");
      return;
    }
    
    setIsUploading(true);
    try {
      // Column names based on renters schema (avatar_name, avatar_uuid, password)
      const dataToSave = {
        avatar_name: renterFormData.avatarName.trim(),
        avatar_uuid: renterFormData.avatarUuid.trim(),
        password: renterFormData.password.trim()
      };
      
      console.log("Saving Resident to 'renters':", dataToSave);
      
      const { error } = await supabase
        .from('renters')
        .upsert(dataToSave, { onConflict: 'avatar_uuid' });

      if (error) {
        alert("Supabase Error (renters): " + error.message);
        throw error;
      }
      
      console.log("Resident saved successfully");
      
      const renterUuid = renterFormData.avatarUuid.trim();
      
      // Update property links
      // 1. Primary link using properties table (for ResidentDashboard primary tenant check)
      const { data: currentLinked } = await supabase.from('properties').select('id').eq('tenant_id', renterUuid);
      const currentLinkedIds = currentLinked?.map(p => p.id) || [];
      
      const toUnlink = currentLinkedIds.filter(id => !selectedPropertyIds.includes(id));
      if (toUnlink.length > 0) {
        const { error: unlinkError } = await supabase.from('properties').update({ tenant_id: null, tenant_name: null, status: 'available' }).in('id', toUnlink);
        if (unlinkError) console.error("Unlink error:", unlinkError);
      }
      
      const toLink = selectedPropertyIds.filter(id => !currentLinkedIds.includes(id));
      if (toLink.length > 0) {
        const updates = toLink.map(id => ({ tenant_id: renterUuid, tenant_name: renterFormData.avatarName.trim(), status: 'rented' }));
        const { error: linkError } = await supabase.from('properties').update({ tenant_id: renterUuid, tenant_name: renterFormData.avatarName.trim(), status: 'rented' }).in('id', toLink);
        if (linkError) console.error("Link error:", linkError);
      }

      // 2. Shared link using property_tenants table (for multiple tenants support)
      // Delete old shared links for this renter that are no longer selected
      await supabase.from('property_tenants').delete().eq('tenant_id', renterUuid);
      
      // Insert new shared links
      if (selectedPropertyIds.length > 0) {
        const newLinks = selectedPropertyIds.map(id => ({
          property_id: parseInt(id),
          tenant_id: renterUuid,
          tenant_name: renterFormData.avatarName.trim()
        }));
        const { error: insertError } = await supabase.from('property_tenants').insert(newLinks);
        if (insertError) console.error("Shared link insert error:", insertError);
      }
      
      showToast("Resident update successful");
      setRenterFormData({ avatarName: '', avatarUuid: '', password: '' });
      setSelectedPropertyIds([]);
      setEditingRenterId(null);
      fetchRenters();
      fetchProperties();
    } catch (error: any) {
      console.error("Save renter error:", error);
      alert("Error saving resident: " + error.message);
      showToast("Save error", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRenter = async (id: string, avatarUuid: string) => {
    const cleanId = String(id).trim();
    const cleanUuid = String(avatarUuid).trim();

    if (!confirm(`Are you sure you want to remove resident ${avatarUuid}?`)) return;
    
    console.log(`Command: DELETE FROM renters WHERE avatar_uuid = '${cleanUuid}'`);
    
    try {
      // Step 1: Sweep properties and shared links first
      await supabase
        .from('properties')
        .update({ tenant_id: null, tenant_name: null, status: 'available' })
        .eq('tenant_id', cleanUuid);
        
      await supabase
        .from('property_tenants')
        .delete()
        .eq('tenant_id', cleanUuid);

      // Step 2: Delete from renters table using avatar_uuid
      const { error } = await supabase
        .from('renters')
        .delete()
        .eq('avatar_uuid', cleanUuid);

      if (error) {
        alert('Supabase Error (Delete Renter): ' + error.message);
        console.error('Error details:', error);
        return;
      }
      
      // Clean screen
      setRenters(prev => prev.filter(r => String(r.avatar_uuid).trim() !== cleanUuid));
      showToast("Resident removed successfully");
    } catch (error: any) {
      alert("Unexpected error: " + error.message);
    }
  };

  const handleResolveTicket = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
    try {
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) return;

      const actionMessage = newStatus === 'resolved' ? "Admin closed the ticket." : "Admin reopened the ticket.";
      const updatedMessage = `${ticket.message}\n\n--- Follow-up ${new Date().toLocaleString()} ---\n${actionMessage}`;

      const { error } = await supabase.from('support_tickets').update({ 
        status: newStatus,
        message: updatedMessage
      }).eq('id', id);
      if (error) throw error;
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, message: updatedMessage } : t));
      showToast(newStatus === 'resolved' ? "Ticket marked as resolved" : "Ticket reopened");
    } catch (err) {
      showToast("Error updating ticket status", "error");
    }
  };

  const handleSendResponse = async (id: string, resolve: boolean = true) => {
    if (!adminResponse.trim()) return;
    setIsSubmittingResponse(true);
    try {
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) return;

      let updatedMessage = ticket.message;
      if (resolve) {
        updatedMessage = `${ticket.message}\n\n--- Follow-up ${new Date().toLocaleString()} ---\nAdmin closed the ticket.`;
      }

      const { error } = await supabase.from('support_tickets').update({ 
        admin_reply: adminResponse, 
        status: resolve ? 'resolved' : 'open',
        message: updatedMessage
      }).eq('id', id);
      
      if (error) throw error;
      
      setTickets(prev => prev.map(t => t.id === id ? { 
        ...t, 
        admin_reply: adminResponse, 
        status: resolve ? 'resolved' : 'open',
        message: updatedMessage
      } : t));
      
      setReplyingTicketId(null);
      setAdminResponse('');
      showToast(resolve ? "Response sent and resolved" : "Response sent");
    } catch (err: any) {
      showToast("Error sending response", "error");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleDeleteTicket = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!id) {
      console.error("Delete Ticket: No ID provided");
      return;
    }

    console.log("Starting delete for Ticket ID:", id);
    if (!confirm("Are you sure you want to permanently delete this ticket?")) return;
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase Delete Error (support_tickets):', error);
        alert('Erro no Supabase: ' + error.message);
        return;
      }
      
      setTickets(prev => prev.filter(t => t.id !== id));
      showToast("Ticket deleted successfully");
    } catch (error: any) {
      console.error('Unexpected error deleting ticket:', error);
      showToast("Delete ticket error: " + error.message, "error");
      fetchTickets();
    }
  };

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

  const filteredProperties = properties.filter(prop => {
    if (activeFilter === 'all') return true;
    if (!prop.expiry_date) return false;
    const expiry = new Date(prop.expiry_date);
    const now = new Date();
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 7;
  }).sort((a, b) => {
    if (activeFilter === 'expiring') {
      return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
    }
    return 0;
  });

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-2 border-white/5 rounded-full absolute inset-0 animate-ping" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(247,203,69,0.2)]"
          >
            <span className="text-black font-black text-4xl">H</span>
          </motion.div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-amber-500 font-bold uppercase tracking-[0.5em] text-xs animate-pulse">Loading Systems</h2>
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

  if (!user || (isAdmin === false)) {
    return (
      <div className="pt-32 pb-24 px-6 bg-black min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          {!user ? <AdminAuthForm /> : (
            <div className="text-center space-y-6 max-w-md bg-zinc-900/50 p-12 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 relative z-10">
                <AlertCircle className="text-red-500 w-10 h-10" />
              </div>
              <div className="space-y-2 relative z-10">
                <h1 className="text-3xl font-display font-bold text-white tracking-tight uppercase">ACCESS DENIED</h1>
                <p className="text-white/40 uppercase tracking-widest text-[10px]">Your account does not have administrative privileges</p>
              </div>
              <div className="space-y-4 text-white relative z-10">
                <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{user.email}</p>
                <button onClick={() => signOut()} className="w-full py-4 rounded-xl border border-white/10 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]">
                  {t('resident.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const unreadInboxCount = inboxMessages.filter(m => !m.is_read).length;
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-6">
          <div className="px-4 mt-8 md:mt-0">
            <GridStatus />
          </div>

          <div className="flex items-center gap-4 px-4 mb-2 text-left">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/50 shrink-0 bg-amber-500/10 flex items-center justify-center">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="text-amber-500" size={20} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.user_metadata?.full_name || user.email}</p>
              <button onClick={() => signOut()} className="text-[10px] text-red-400 uppercase tracking-widest hover:underline">{t('resident.logout')}</button>
            </div>
          </div>

          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 px-4 mb-4">{t('admin.navigation.title')}</h2>
          {[
            { id: 'add', name: editingId ? t('admin.navigation.edit_property') : t('admin.navigation.add_property'), icon: Plus },
            { id: 'listings', name: t('admin.navigation.listings'), icon: BarChart3 },
            { id: 'renters', name: t('admin.navigation.renters'), icon: UserIcon },
            { id: 'portfolio', name: t('admin.navigation.portfolio'), icon: ImageIcon },
            { id: 'pricing', name: t('admin.navigation.pricing'), icon: DollarSign },
            { id: 'gallery', name: t('admin.navigation.gallery'), icon: ImageIcon },
            { id: 'hero', name: t('admin.navigation.hero_section'), icon: ImageIcon },
            { id: 'team', name: t('admin.navigation.team'), icon: UserIcon },
            { id: 'inbox', name: t('admin.navigation.inbox'), icon: Mail, hasNotification: unreadInboxCount > 0 },
            { id: 'tickets', name: t('admin.navigation.support'), icon: MessageSquare, hasNotification: openTicketsCount > 0 },
            { id: 'covenant', name: t('admin.navigation.covenant'), icon: FileText },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium relative",
                activeTab === item.id ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.name}
              </div>
              {item.hasNotification && (
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  activeTab === item.id ? "bg-black" : "bg-amber-500"
                )} />
              )}
            </button>
          ))}
        </aside>

        <main className="flex-1">
          {activeTab === 'tickets' && (
            <AdminSupportTickets 
              tickets={tickets} 
              onRefresh={fetchTickets}
              replyingTicketId={replyingTicketId}
              setReplyingTicketId={setReplyingTicketId}
              adminResponse={adminResponse}
              setAdminResponse={setAdminResponse}
              isSubmittingResponse={isSubmittingResponse}
              handleResolveTicket={handleResolveTicket}
              handleSendResponse={handleSendResponse}
              handleDeleteTicket={handleDeleteTicket}
              stats={stats}
            />
          )}

          {activeTab === 'renters' && (
            <AdminResidents 
              renters={renters}
              properties={properties}
              allPropertyTenants={allPropertyTenants}
              renterFormData={renterFormData}
              setRenterFormData={setRenterFormData}
              selectedPropertyIds={selectedPropertyIds}
              setSelectedPropertyIds={setSelectedPropertyIds}
              editingRenterId={editingRenterId}
              setEditingRenterId={setEditingRenterId}
              handleSaveRenter={handleSaveRenter}
              handleDeleteRenter={handleDeleteRenter}
            />
          )}

          {activeTab === 'portfolio' && (
            <AdminPortfolioManager showToast={showToast} />
          )}

          {activeTab === 'pricing' && (
            <AdminPricingManager showToast={showToast} />
          )}

          {activeTab === 'hero' && (
            <AdminHeroSection 
              heroContent={heroContent}
              setHeroContent={setHeroContent}
              isUploadingSlot={isUploadingSlot}
              handleFileUpload={handleFileUpload}
              handleSaveHero={handleSaveHero}
            />
          )}

          {activeTab === 'inbox' && (
            <AdminInbox 
              inboxMessages={inboxMessages}
              onRefresh={fetchInboxMessages}
              handleToggleRead={handleToggleRead}
              handleDeleteMessage={handleDeleteMessage}
            />
          )}

          {activeTab === 'team' && (
            <AdminTeamManager 
              teamMembers={teamMembers}
              teamFormData={teamFormData}
              setTeamFormData={setTeamFormData}
              editingTeamId={editingTeamId}
              setEditingTeamId={setEditingTeamId}
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
              handleSaveTeam={handleSaveTeam}
              handleDeleteTeam={handleDeleteTeam}
              handleEditTeam={handleEditTeam}
            />
          )}

          {activeTab === 'gallery' && (
            <AdminGalleryManager 
              galleryImages={galleryImages}
              galleryFormData={galleryFormData}
              setGalleryFormData={setGalleryFormData}
              isUploadingSlot={isUploadingSlot}
              handleFileUpload={handleFileUpload}
              handleGallerySave={handleGallerySave}
              handleDeleteGallery={handleDeleteGallery}
            />
          )}

          {activeTab === 'covenant' && (
            <AdminLandCovenant 
              covenants={covenants}
              setCovenants={setCovenants}
              isDirty={isDirty}
              setIsDirty={setIsDirty}
              handleSaveCovenant={handleSaveCovenant}
            />
          )}

          {activeTab === 'listings' && (
            <AdminPropertyListings 
              properties={properties}
              stats={stats}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              filteredProperties={filteredProperties}
              setActiveTab={setActiveTab}
              handleEdit={handleEditProperty}
              handleDelete={handleDeleteProperty}
              showToast={showToast}
            />
          )}

          {activeTab === 'add' && (
            <AdminPropertyForm 
              editingId={editingId}
              setEditingId={setEditingId}
              formData={formData}
              setFormData={setFormData}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              handleInputChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              handleFileUpload={handleFileUpload}
              handleSave={handleSaveProperty}
              lang={selectedDescriptionLang}
              setLang={setSelectedDescriptionLang}
            />
          )}
        </main>
      </div>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </div>
  );
}
