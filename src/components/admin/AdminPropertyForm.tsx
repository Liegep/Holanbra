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
import { cn } from '../../lib/utils';

interface AdminPropertyFormProps {
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  formData: any;
  setFormData: (val: any | ((prev: any) => any)) => void;
  formLang: 'pt' | 'en' | 'es' | 'nl';
  setFormLang: (lang: 'pt' | 'en' | 'es' | 'nl') => void;
  isUploading: boolean;
  uploadProgress: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target: string) => void;
  handleSave: () => void;
}

export function AdminPropertyForm({
  editingId,
  setEditingId,
  formData,
  setFormData,
  formLang,
  setFormLang,
  isUploading,
  uploadProgress,
  handleInputChange,
  handleFileUpload,
  handleSave
}: AdminPropertyFormProps) {
  const propertyTypeOptions = ['Land', 'Furnished', 'Not Furnished', 'Skybox', 'Shop', 'House'];

  const togglePropertyType = (type: string) => {
    const currentTypes = formData.property_type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t: string) => t !== type)
      : [...currentTypes, type];
    
    setFormData((prev: any) => ({ ...prev, property_type: newTypes }));
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex justify-between items-center text-white">
        <h3 className="text-2xl font-bold font-display text-left">
          {editingId ? "Edit Property Configuration" : "Add New Real Estate Asset"}
        </h3>
        {editingId && (
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                casperletId: '',
                price: '',
                rental_price: '',
                teleport_url: '',
                status: 'available',
                description: '',
                description_pt: '',
                description_en: '',
                description_es: '',
                description_nl: '',
                imageUrl: '',
                expiry_date: '',
                tenant_name: '',
                tenant_id: '',
                property_type: []
              });
            }}
            className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase">Property Display Name</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
            placeholder="Ex: Dutch Mansion Luxury Parcel" 
          />
        </div>

        <div className="space-y-4 text-left">
          <label className="text-xs font-bold text-amber-500/70 uppercase">Property Type (Multi-select)</label>
          <div className="flex flex-wrap gap-2">
            {propertyTypeOptions.map(type => (
              <button
                key={type}
                onClick={() => togglePropertyType(type)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
                  formData.property_type?.includes(type)
                    ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-amber-500/70 uppercase">Base Price (L$)</label>
            <input 
              type="number" 
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
              placeholder="1000" 
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-amber-500/70 uppercase">Rental Price (L$ / Week)</label>
            <input 
              type="number" 
              name="rental_price"
              value={formData.rental_price}
              onChange={handleInputChange}
              className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
              placeholder="1500" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-amber-500/70 uppercase">Tenant Name</label>
            <input 
              type="text" 
              name="tenant_name"
              value={formData.tenant_name}
              onChange={handleInputChange}
              className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
              placeholder="Resident Name" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-gray-500 uppercase">Tenant UUID</label>
            <input 
              type="text" 
              name="tenant_id"
              value={formData.tenant_id}
              onChange={handleInputChange}
              className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
              placeholder="00000000-0000-0000-0000-000000000000"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-gray-500 uppercase">Casperlet Device ID</label>
            <input 
              type="text" 
              name="casperletId"
              value={formData.casperletId}
              onChange={handleInputChange}
              className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner" 
              placeholder="Paste the SL device UUID here"
            />
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

        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-amber-500/70 uppercase">Property Description</label>
            <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              {(['pt', 'en', 'es', 'nl'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setFormLang(lang)}
                  className={cn(
                    "px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all",
                    formLang === lang ? "bg-amber-500 text-black shadow-lg" : "text-white/40 hover:text-white"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <textarea 
            name={`description_${formLang}`}
            value={(formData as any)[`description_${formLang}`]}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev: any) => ({ 
                ...prev, 
                [`description_${formLang}`]: val 
              }));
            }}
            rows={6}
            className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner transition-all" 
            placeholder={`Property Description (${formLang.toUpperCase()})...`}
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
                <option value="available" className="bg-zinc-900 text-white">Available</option>
                <option value="rented" className="bg-zinc-900 text-white">Rented</option>
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
                  onClick={() => setFormData((prev: any) => ({ ...prev, imageUrl: '' }))}
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
            {editingId ? "Update Configuration" : "Publish to Listings"}
          </button>
        </div>
      </div>
    </div>
  );
}
