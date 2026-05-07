import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Loader2, Plus, X, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { ToastType } from '../Toast';
import imageCompression from 'browser-image-compression';

export const AdminPortfolioManager = ({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) => {
  const { t } = useTranslation();
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({ title: '', description: '', image_url: '' });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn("Error fetching portfolio:", error);
      } else {
        setPortfolioItems(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      
      setIsUploading(true);
      setUploadProgress(10);
      
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        onProgress: (p: number) => setUploadProgress(10 + Math.floor(p * 0.4))
      };
      
      const compressedFile = await imageCompression(file, options);
      setUploadProgress(50);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;
      
      setUploadProgress(90);

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      showToast(t('admin.common.success.media_processed'));
      
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url || !formData.title) {
        showToast(t('admin.common.error.required'), "error");
        return;
    }

    try {
        const { error } = await supabase.from('portfolio').insert([
            {
                title: formData.title.trim(),
                description: formData.description.trim(),
                image_url: formData.image_url
            }
        ]);

        if (error) throw error;
        
        showToast(t('admin.common.success.added'));
        setFormData({ title: '', description: '', image_url: '' });
        fetchPortfolio();
    } catch (err: any) {
        showToast(err.message, "error");
    }
  };

  const deleteItem = async (id: string, imageUrl: string) => {
    if (!confirm(t('admin.common.confirm_delete'))) return;

    try {
      const { error } = await supabase.from('portfolio').delete().eq('id', id);
      if (error) throw error;

      setPortfolioItems(prev => prev.filter(item => item.id !== id));

      if (imageUrl && imageUrl.includes('supabase.co')) {
        try {
          const path = imageUrl.split('/media/')[1];
          if (path) {
            await supabase.storage.from('media').remove([path]);
          }
        } catch (e) {
          console.error("Failed to delete from storage:", e);
        }
      }

      showToast(t('admin.common.success.deleted'));
      fetchPortfolio();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
          <ImageIcon className="text-amber-500" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin.portfolio.title')}</h2>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{t('admin.portfolio.subtitle')}</p>
        </div>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{t('admin.fields.title')} *</label>
                    <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-amber-500/50 outline-none"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{t('admin.property.description')}</label>
                    <input 
                        type="text" 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-amber-500/50 outline-none"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{t('admin.fields.photo')} *</label>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={formData.image_url} 
                        readOnly 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm opacity-50 outline-none" 
                        placeholder={t('admin.portfolio.placeholder_url')}
                    />
                    <label className="shrink-0 flex items-center justify-center px-6 bg-amber-500 text-black font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : t('admin.portfolio.upload_image')}
                    </label>
                </div>

                {isUploading && (
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                        <motion.div className="h-full bg-amber-500" style={{ width: `${uploadProgress}%` }} />
                    </div>
                )}

                {formData.image_url && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 max-w-sm">
                        <img src={formData.image_url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-2 right-2 p-2 inset-auto bg-red-500 text-white rounded-full"><X size={12} /></button>
                    </div>
                )}
            </div>

            <button type="submit" disabled={isUploading || !formData.image_url || !formData.title} className="px-8 py-4 bg-amber-500 text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all w-full flex justify-center gap-2 items-center">
                <Plus size={16} />
                {t('admin.portfolio.add_button')}
            </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map(item => (
            <div key={item.id} className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 aspect-[4/5]">
                <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 p-6 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{item.title}</h3>
                        {item.description && <p className="text-white/60 text-xs mt-1 truncate max-w-[200px]">{item.description}</p>}
                    </div>
                    <button onClick={() => deleteItem(item.id, item.image_url)} className="p-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl backdrop-blur-md transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
