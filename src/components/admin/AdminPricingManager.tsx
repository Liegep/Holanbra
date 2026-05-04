import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Plus, X, Trash2, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { ToastType } from '../Toast';

interface PricingPackage {
  id: string;
  name: string;
  price: string;
  features: string[];
  is_popular: boolean;
  order_idx: number;
}

export const AdminPricingManager = ({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) => {
  const { t, i18n } = useTranslation();
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PricingPackage>({
    id: '',
    name: '',
    price: '',
    features: [''],
    is_popular: false,
    order_idx: 1
  });

  useEffect(() => {
    fetchPackages();
  }, [i18n.language]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pricing_packages')
        .select('*')
        .order('order_idx', { ascending: true });
        
      if (error) {
        console.warn('Pricing table error:', error);
        setPackages([]);
      } else {
        setPackages(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureChange = (index: number, val: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = val;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      price: '',
      features: [''],
      is_popular: false,
      order_idx: packages.length + 1
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.features.filter(f => f.trim()).length === 0) {
      showToast(t('admin.pricing.error_required'), "error");
      return;
    }

    try {
      const cleanFeatures = formData.features.filter(f => f.trim() !== '');
      const payload = {
        name: formData.name.trim(),
        price: formData.price.trim(),
        features: cleanFeatures,
        is_popular: formData.is_popular,
        order_idx: formData.order_idx
      };

      if (formData.id) {
        const { error } = await supabase.from('pricing_packages').update(payload).eq('id', formData.id);
        if (error) throw error;
        showToast(t('admin.pricing.success_updated'));
      } else {
        const { error } = await supabase.from('pricing_packages').insert([payload]);
        if (error) throw error;
        showToast(t('admin.pricing.success_created'));
      }

      resetForm();
      fetchPackages();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.pricing.confirm_delete'))) return;
    try {
      const { error } = await supabase.from('pricing_packages').delete().eq('id', id);
      if (error) throw error;
      showToast(t('admin.pricing.success_deleted'));
      fetchPackages();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === packages.length - 1)
    ) return;

    const newPackages = [...packages];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap objects
    const temp = newPackages[index];
    newPackages[index] = newPackages[swapIndex];
    newPackages[swapIndex] = temp;

    // Fix order_idx
    newPackages[index].order_idx = index + 1;
    newPackages[swapIndex].order_idx = swapIndex + 1;

    setPackages([...newPackages]); // Optimistic update

    try {
      // Send bulk updates
      for (const pkg of [newPackages[index], newPackages[swapIndex]]) {
        await supabase.from('pricing_packages').update({ order_idx: pkg.order_idx }).eq('id', pkg.id);
      }
      showToast(t('admin.pricing.order_updated'), "success");
    } catch (err) {
      console.error(err);
      fetchPackages(); // Revert on error
    }
  };

  const handleEdit = (pkg: PricingPackage) => {
    setFormData({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      features: pkg.features.length > 0 ? pkg.features : [''],
      is_popular: pkg.is_popular,
      order_idx: pkg.order_idx
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
          <DollarSign className="text-amber-500" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin.pricing.title')}</h2>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{t('admin.pricing.subtitle')}</p>
        </div>
      </div>

      {/* Editor Form */}
      <div className="glass-card p-8 rounded-2xl border border-white/5 bg-white/5 space-y-8">
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white">{isEditing ? t('admin.pricing.editing') : t('admin.pricing.create_new')}</h3>
            {isEditing && (
                <button onClick={resetForm} className="text-xs text-amber-500 hover:text-white uppercase tracking-widest font-bold">
                    {t('admin.pricing.cancel_edit')}
                </button>
            )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{t('admin.pricing.package_name', 'Package Name')} *</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-amber-500/50 outline-none"
                        placeholder="e.g. Standard Home"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">{t('admin.fields.price')} *</label>
                    <input 
                        type="text" 
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-amber-500/50 outline-none"
                        placeholder="e.g. L$ 7,500"
                        required
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 flex items-center justify-between">
                    <span>{t('admin.pricing.features_list')} *</span>
                    <button type="button" onClick={addFeature} className="text-amber-500/70 hover:text-amber-500 flex items-center gap-1">
                        <Plus size={12} /> {t('admin.pricing.add_row')}
                    </button>
                </label>
                <div className="space-y-3">
                    <AnimatePresence>
                        {formData.features.map((feature, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex gap-2"
                            >
                                <input 
                                    type="text" 
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-amber-500/50 outline-none"
                                    placeholder={`${t('admin.pricing.feature_placeholder')} ${idx + 1}`}
                                />
                                {formData.features.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeFeature(idx)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${formData.is_popular ? 'bg-amber-500 border-amber-500' : 'bg-black/20 border-white/20 group-hover:border-amber-500/50'}`}>
                        {formData.is_popular && <CheckCircle size={16} className="text-black" />}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.is_popular} 
                        onChange={(e) => setFormData({...formData, is_popular: e.target.checked})} 
                    />
                    <span className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">{t('admin.pricing.highlight_popular')}</span>
                </label>
            </div>

            <button type="submit" className="w-full px-8 py-4 bg-amber-500 text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all flex justify-center gap-2 items-center">
                {isEditing ? t('admin.pricing.update_button') : t('admin.pricing.create_button')}
            </button>
        </form>
      </div>

      {/* Package List */}
      <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">{t('admin.pricing.current_packages')} ({packages.length})</h3>
      
      {loading ? (
        <div className="text-center py-12"><p className="text-white/50 text-xs uppercase tracking-widest animate-pulse font-bold">{t('admin.pricing.loading')}</p></div>
      ) : packages.length === 0 ? (
        <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-amber-500/70 text-xs uppercase tracking-widest font-bold">{t('admin.pricing.none_found')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
                <div key={pkg.id} className={`bg-white/5 border rounded-2xl p-6 relative flex flex-col ${pkg.is_popular ? 'border-amber-500 text-amber-500 shadow-xl shadow-amber-500/5' : 'border-white/10'}`}>
                    
                    {/* Order Controls */}
                    <div className="absolute top-4 right-4 flex gap-1 bg-black/40 p-1 rounded-lg backdrop-blur-md border border-white/10 z-10 text-white">
                        <button disabled={idx === 0} onClick={() => handleMove(idx, 'up')} className="p-1 hover:text-amber-500 disabled:opacity-30 disabled:hover:text-white transition-colors"><ChevronUp size={16} /></button>
                        <button disabled={idx === packages.length - 1} onClick={() => handleMove(idx, 'down')} className="p-1 hover:text-amber-500 disabled:opacity-30 disabled:hover:text-white transition-colors"><ChevronDown size={16} /></button>
                    </div>

                    {pkg.is_popular && <div className="absolute top-[-10px] left-6 bg-amber-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{t('pricing.popular')}</div>}
                    
                    <h4 className="text-lg font-bold mt-2 text-white">{pkg.name}</h4>
                    <p className="text-2xl font-black mb-4 text-white">{pkg.price}</p>
                    
                    <ul className="text-xs text-white/60 space-y-2 mb-6 flex-1">
                        {pkg.features.map((f, i) => (
                            <li key={i} className="flex gap-2 items-start"><span className="text-amber-500 mt-0.5">•</span> <span>{f}</span></li>
                        ))}
                    </ul>

                    <div className="flex gap-2 mt-auto pt-4 border-t border-white/10">
                        <button onClick={() => handleEdit(pkg)} className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">{t('admin.common.edit')}</button>
                        <button onClick={() => handleDelete(pkg.id)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
