import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Save, Image as ImageIcon, Link as LinkIcon, Facebook, MapPin, Loader2 } from 'lucide-react';
import { ToastType } from '../Toast';
import imageCompression from 'browser-image-compression';

interface LinkSettings {
  facebook_url: string;
  location_url: string;
  logo_url: string;
}

export const AdminLinkManager = ({ showToast }: { showToast: (msg: string, type: ToastType) => void }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<LinkSettings>({
    facebook_url: '',
    location_url: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('facebook_url, location_url, logo_url')
      .eq('id', 'site_links')
      .maybeSingle();

    if (data) {
      setSettings({
        facebook_url: data.facebook_url || '',
        location_url: data.location_url || '',
        logo_url: data.logo_url || ''
      });
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/webp' };
      const compressedFile = await imageCompression(file, options);
      
      const fileName = `logo_${Math.random().toString(36).substring(7)}.webp`;
      const filePath = `site/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, compressedFile);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
        
      setSettings(prev => ({ ...prev, logo_url: publicUrl }));
      showToast("Logo uploaded successfully", "success");
    } catch (error: any) {
      showToast("Upload failed: " + error.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 'site_links', ...settings });

    if (error) {
      showToast("Error saving links", "error");
    } else {
      showToast("Settings saved successfully", "success");
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-display">Global Settings</h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Manage core links and branding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-white/5 space-y-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-amber-500">
               <ImageIcon size={18} />
               <span className="text-xs font-black uppercase tracking-widest">Logo Branding</span>
             </div>
             
             <div className="relative group aspect-square max-w-[200px] mx-auto rounded-2xl overflow-hidden border-2 border-white/5 bg-black/50 flex items-center justify-center">
                {settings.logo_url ? (
                  <img src={settings.logo_url} className="max-w-[80%] max-h-[80%] object-contain" alt="Logo" />
                ) : (
                  <ImageIcon className="text-white/10" size={48} />
                )}
                
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                  <div className="px-4 py-2 bg-white text-black text-[10px] font-black rounded-lg">
                    {isUploading ? "Uploading..." : "Change Logo"}
                  </div>
                </label>
             </div>
             <input 
               type="text" 
               value={settings.logo_url}
               onChange={(e) => setSettings(prev => ({ ...prev, logo_url: e.target.value }))}
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white/40 outline-none"
               placeholder="URL do Logo"
             />
          </div>
        </div>

        <div className="glass-card p-8 border-white/5 space-y-6">
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <Facebook size={12} className="text-blue-500" /> Facebook Page URL
                </label>
                <input 
                  type="text"
                  value={settings.facebook_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, facebook_url: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-all"
                  placeholder="https://facebook.com/..."
                />
             </div>

             <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <MapPin size={12} className="text-red-500" /> Second Life Location URL
                </label>
                <input 
                  type="text"
                  value={settings.location_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, location_url: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-all"
                  placeholder="secondlife://..."
                />
             </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-amber-500 transition-all shadow-xl"
          >
            <Save size={16} /> Save Global Settings
          </button>
        </div>
      </div>
    </div>
  );
};
