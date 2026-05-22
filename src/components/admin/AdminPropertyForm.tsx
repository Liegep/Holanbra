import React from 'react';
import { 
  Plus, 
  RefreshCw, 
  Calendar, 
  Link as LinkIcon, 
  Loader2, 
  Image as ImageIcon, 
  X,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnStrikeThrough, BtnLink, BtnBulletList, BtnNumberedList, BtnClearFormatting, BtnUndo, BtnRedo, BtnUnderline, BtnStyles, ContentEditable } from 'react-simple-wysiwyg';
import { cn } from '../../lib/utils';

interface AdminPropertyFormProps {
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  formData: any;
  initialFormData: any;
  setFormData: (val: any | ((prev: any) => any)) => void;
  isUploading: boolean;
  uploadProgress: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target: string) => void;
  handleSave: () => void;
  lang: string;
  setLang: (lang: string) => void;
}

export function AdminPropertyForm({
  editingId,
  setEditingId,
  formData,
  initialFormData,
  setFormData,
  isUploading,
  uploadProgress,
  handleInputChange,
  handleFileUpload,
  handleSave,
  lang,
  setLang
}: AdminPropertyFormProps) {
  const { t } = useTranslation();
  const propertyTypeOptions = ['Land', 'Furnished', 'Not Furnished', 'Skybox', 'Shop', 'House'];
  const perkOptions = ['radio', 'beach_front', 'tv', 'security_orb', 'full_owner_rights', 'home_management_system'] as const;

  const togglePropertyType = (type: string) => {
    const currentTypes = formData.property_type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t: string) => t !== type)
      : [...currentTypes, type];
    
    setFormData((prev: any) => ({ ...prev, property_type: newTypes }));
  };

  const togglePerk = (perk: string) => {
    const currentPerks = formData.perks || [];
    const newPerks = currentPerks.includes(perk)
      ? currentPerks.filter((p: string) => p !== perk)
      : [...currentPerks, perk];
    
    setFormData((prev: any) => ({ ...prev, perks: newPerks }));
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex justify-between items-center text-white">
        <h3 className="text-2xl font-bold font-display text-left">
          {editingId ? t('admin.property.edit_config') : t('admin.property.add_new')}
        </h3>
        {editingId && (
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData(initialFormData);
            }}
            className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline"
          >
            {t('admin.property.cancel')}
          </button>
        )}
      </div>

      
      <div className="space-y-6">
        <div className="space-y-2 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase flex items-center gap-1">
            {t('admin.property.display_name')} <span className="text-red-500 text-lg">*</span>
          </label>
          <input 
            type="text" 
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
            placeholder={t('admin.property.placeholder_name')} 
          />
        </div>

        <div className="space-y-4 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase">{t('admin.property.type')} ({t('common.multi_select', 'Multi-select')})</label>
          <div className="flex flex-wrap gap-2">
            {propertyTypeOptions.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => togglePropertyType(type)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
                  formData.property_type?.includes(type)
                    ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                )}
              >
                {t(`admin.property.types.${type.toLowerCase().replace(' ', '_')}`, type)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase">{t('admin.property.perks', 'House perks')} ({t('common.multi_select', 'Multi-select')})</label>
          <div className="flex flex-wrap gap-2">
            {perkOptions.map(perk => (
              <button
                key={perk}
                type="button"
                onClick={() => togglePerk(perk)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
                  formData.perks?.includes(perk)
                    ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                )}
              >
                {t(`perks.${perk}`, perk.replace('_', ' '))}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-amber-500/70 uppercase flex items-center gap-1">
              {t('admin.property.price_week')} <span className="text-red-500 text-lg">*</span>
            </label>
            <input 
              type="number" 
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
              placeholder={t('admin.property.placeholder_price')} 
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-amber-500/70 uppercase">
              {t('admin.property.prims_allowed')}
            </label>
            <input 
              type="number" 
              name="prims_allowed"
              value={formData.prims_allowed}
              onChange={handleInputChange}
              className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase">{t('admin.property.teleport_slurl')}</label>
          <div className="relative">
            <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              name="teleport_url"
              value={formData.teleport_url}
              onChange={handleInputChange}
              className="w-full glass-card bg-transparent border-white/10 p-4 pl-12 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
              placeholder={t('admin.property.placeholder_slurl')} 
            />
          </div>
        </div>
      
        <div className="space-y-2 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase">{t('admin.property.description')}</label>
          <div className="flex gap-2 mb-2">
            {['en', 'pt', 'nl', 'es'].map(l => (
              <button 
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  "px-3 py-1 rounded text-[10px] font-bold uppercase",
                  lang === l ? "bg-amber-500 text-black" : "bg-white/5 text-white/40"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="glass-card bg-transparent border-white/10 overflow-hidden focus-within:border-amber-500 transition-all">
            <EditorProvider>
              <Editor 
                key={lang}
                value={formData[lang === 'en' ? 'description' : `description_${lang}`] || ''} 
                onChange={(e) => {
                  console.log(`Lang: ${lang}, Value: ${e.target.value}`);
                  setFormData((prev: any) => ({
                    ...prev,
                    [lang === 'en' ? 'description' : `description_${lang}`]: e.target.value
                  }));
                }}
                className="min-h-[200px] text-sm text-white"
              >
                <Toolbar>
                  <BtnUndo />
                  <BtnRedo />
                  <BtnStyles />
                  <BtnBold />
                  <BtnItalic />
                  <BtnUnderline />
                  <BtnStrikeThrough />
                  <BtnLink />
                  <BtnBulletList />
                  <BtnNumberedList />
                  <BtnClearFormatting />
                </Toolbar>
              </Editor>
            </EditorProvider>
          </div>
        </div>

        {/* STATUS DROPDOWN */}
        <div className="space-y-2 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase">{t('admin.property.availability')}</label>
          <div className="relative">
            <select 
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full glass-card bg-background-dark border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white appearance-none cursor-pointer"
            >
              <option value="available" className="bg-zinc-900 text-white">{t('admin.property.status.available')}</option>
              <option value="rented" className="bg-zinc-900 text-white">{t('admin.property.status.rented')}</option>
              <option value="maintenance" className="bg-zinc-900 text-white">{t('admin.property.status.maintenance')}</option>
            </select>
            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
          </div>
        </div>

          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-amber-500/70 uppercase flex items-center gap-1">
                {t('admin.property.main_image')} <span className="text-red-500 text-lg">*</span>
              </label>
              <div className="flex gap-4">
                <input 
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="flex-1 glass-card bg-transparent border-white/10 p-4 text-sm outline-none text-white shadow-inner focus:border-amber-500"
                  placeholder={t('admin.portfolio.placeholder_url')}
                />
                <label className="shrink-0 flex items-center justify-center px-4 bg-amber-500 border border-amber-400 rounded-xl cursor-pointer hover:bg-amber-400 transition-all group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'imageUrl')}
                    disabled={isUploading}
                  />
                  <ImageIcon size={16} className="text-black" />
                </label>
              </div>
              {formData.imageUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                  <img src={formData.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button onClick={() => setFormData((prev: any) => ({ ...prev, imageUrl: '' }))} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-amber-500/70 uppercase">{t('admin.property.gallery_photo_1')}</label>
                <div className="flex gap-2">
                  <label className="w-full flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'gallery_image_1')}
                      disabled={isUploading}
                    />
                    {formData.gallery_image_1 ? (
                      <img src={formData.gallery_image_1} className="w-full h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                    ) : (
                      <Plus size={16} className="text-white/20 group-hover:text-amber-500" />
                    )}
                  </label>
                  {formData.gallery_image_1 && (
                    <button onClick={() => setFormData((prev: any) => ({ ...prev, gallery_image_1: '' }))} className="p-2 bg-white/5 border border-white/10 text-red-500 rounded-xl hover:bg-red-500/10 transition-all">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-amber-500/70 uppercase">{t('admin.property.gallery_photo_2')}</label>
                <div className="flex gap-2">
                  <label className="w-full flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'gallery_image_2')}
                      disabled={isUploading}
                    />
                    {formData.gallery_image_2 ? (
                      <img src={formData.gallery_image_2} className="w-full h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                    ) : (
                      <Plus size={16} className="text-white/20 group-hover:text-amber-500" />
                    )}
                  </label>
                  {formData.gallery_image_2 && (
                    <button onClick={() => setFormData((prev: any) => ({ ...prev, gallery_image_2: '' }))} className="p-2 bg-white/5 border border-white/10 text-red-500 rounded-xl hover:bg-red-500/10 transition-all">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-left col-span-2">
                <label className="text-[10px] font-bold text-amber-500/70 uppercase">{t('admin.property.video_asset')}</label>
                <div className="flex gap-2">
                  <label className="w-full flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all group">
                    <input 
                      type="file" 
                      accept="video/mp4" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'videoUrl')}
                      disabled={isUploading}
                    />
                    {formData.videoUrl ? (
                      <video src={formData.videoUrl} className="w-full h-12 object-cover rounded-lg" />
                    ) : (
                      <Plus size={16} className="text-white/20 group-hover:text-amber-500" />
                    )}
                  </label>
                  {formData.videoUrl && (
                    <button onClick={() => setFormData((prev: any) => ({ ...prev, videoUrl: '' }))} className="p-2 bg-white/5 border border-white/10 text-red-500 rounded-xl hover:bg-red-500/10 transition-all">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-amber-500">
                   <span>{t('admin.property.processing_media')}</span>
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
          </div>

        {/* SECONDARY SETTINGS (OPTIONAL FIELDS) */}
        <div className="pt-8 border-t border-white/5 space-y-6 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">{t('admin.property.secondary_settings')}</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase">{t('admin.property.tenant_name')}</label>
              <input 
                type="text" 
                name="tenant_name"
                value={formData.tenant_name}
                onChange={handleInputChange}
                className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                placeholder={t('admin.property.placeholder_tenant')} 
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase">{t('admin.property.tenant_uuid')}</label>
              <input 
                type="text" 
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleInputChange}
                className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                placeholder={t('admin.property.placeholder_uuid')} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase">{t('admin.property.expiry_date')}</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input 
                  type="date" 
                  name="expiry_date"
                  value={formData.expiry_date ? formData.expiry_date.split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full glass-card bg-transparent border-white/10 p-4 pl-12 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                />
              </div>
            </div>
            
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-amber-500/50 uppercase">🕒 {t('admin.property.calc_time', 'Quick Time Calc')}</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input 
                    type="number" 
                    id="calc-weeks"
                    placeholder="W"
                    className="w-full glass-card bg-white/5 border-white/10 p-4 text-xs focus:border-amber-500 outline-none text-white shadow-inner"
                    onChange={() => {
                      const w = parseInt((document.getElementById('calc-weeks') as HTMLInputElement)?.value || "0");
                      const d = parseInt((document.getElementById('calc-days') as HTMLInputElement)?.value || "0");
                      const totalMs = (w * 7 * 24 * 60 * 60 * 1000) + (d * 24 * 60 * 60 * 1000);
                      if (totalMs > 0) {
                        const newDate = new Date(Date.now() + totalMs).toISOString();
                        setFormData((prev: any) => ({ ...prev, expiry_date: newDate }));
                      }
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-white/20 uppercase pointer-events-none">Wks</span>
                </div>
                <div className="flex-1 relative">
                  <input 
                    id="calc-days"
                    type="number" 
                    placeholder="D"
                    className="w-full glass-card bg-white/5 border-white/10 p-4 text-xs focus:border-amber-500 outline-none text-white shadow-inner"
                    onChange={() => {
                      const w = parseInt((document.getElementById('calc-weeks') as HTMLInputElement)?.value || "0");
                      const d = parseInt((document.getElementById('calc-days') as HTMLInputElement)?.value || "0");
                      const totalMs = (w * 7 * 24 * 60 * 60 * 1000) + (d * 24 * 60 * 60 * 1000);
                      if (totalMs > 0) {
                        const newDate = new Date(Date.now() + totalMs).toISOString();
                        setFormData((prev: any) => ({ ...prev, expiry_date: newDate }));
                      }
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-white/20 uppercase pointer-events-none">Days</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase">{t('admin.property.casperlet_id')}</label>
              <input 
                type="text" 
                name="casperletId"
                value={formData.casperletId}
                onChange={handleInputChange}
                className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
                placeholder={t('admin.property.placeholder_device')} 
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button 
            onClick={handleSave}
            disabled={isUploading}
            className="w-full py-5 rounded-2xl bg-amber-500 text-black font-black flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(245,158,11,0.2)] hover:bg-amber-400 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50"
          >
            {editingId ? <RefreshCw size={18} /> : <Plus size={18} />}
            {editingId ? t('admin.property.update') : t('admin.property.publish')}
          </button>
        </div>
      </div>
    </div>
  );
}
