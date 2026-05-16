import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DecorationOrderFormProps {
  packageName: string;
  onClose: () => void;
}

export const DecorationOrderForm: React.FC<DecorationOrderFormProps> = ({ packageName, onClose }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    discord_id: '',
    region_name: '',
    environments: '',
    style: '',
    prims_available: '',
    deadline: '',
    details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('decoration_orders')
        .insert([
          {
            package_name: packageName,
            customer_name: formData.customer_name,
            discord_id: formData.discord_id,
            region_name: formData.region_name,
            environments: formData.environments,
            style: formData.style,
            prims_available: formData.prims_available,
            deadline: formData.deadline,
            details: formData.details,
            status: 'pending'
          }
        ]);

      if (error) throw error;
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting decoration order:', error);
      alert('Error sending request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-32 bg-gray-900 flex items-center px-8">
          <div className="absolute top-0 right-0 p-4">
            <button
              id="close-order-form-btn"
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center text-gray-900 shadow-lg shadow-amber-400/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{t('pricing.order_form.title')}</h2>
              <p className="text-amber-400/80 font-medium">{packageName}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="form"
                id="decoration-order-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 flex flex-col">
                    <label id="label-customer-name" className="text-sm font-semibold text-gray-700 ml-1">
                      {t('pricing.order_form.name_label')}
                    </label>
                    <input
                      id="input-customer-name"
                      required
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                      placeholder={t('pricing.order_form.name_placeholder')}
                      value={formData.customer_name}
                      onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <label id="label-discord-id" className="text-sm font-semibold text-gray-700 ml-1">
                      {t('pricing.order_form.discord_label')}
                    </label>
                    <input
                      id="input-discord-id"
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                      placeholder={t('pricing.order_form.discord_placeholder')}
                      value={formData.discord_id}
                      onChange={e => setFormData({ ...formData, discord_id: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label id="label-region-name" className="text-sm font-semibold text-gray-700 ml-1">
                    {t('pricing.order_form.region_label')}
                  </label>
                  <input
                    id="input-region-name"
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                    placeholder={t('pricing.order_form.region_placeholder')}
                    value={formData.region_name}
                    onChange={e => setFormData({ ...formData, region_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 flex flex-col">
                    <label id="label-environments" className="text-sm font-semibold text-gray-700 ml-1">
                      {t('pricing.order_form.environments_label')}
                    </label>
                    <input
                      id="input-environments"
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                      placeholder={t('pricing.order_form.environments_placeholder')}
                      value={formData.environments}
                      onChange={e => setFormData({ ...formData, environments: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <label id="label-style" className="text-sm font-semibold text-gray-700 ml-1">
                      {t('pricing.order_form.style_label')}
                    </label>
                    <input
                      id="input-style"
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                      placeholder={t('pricing.order_form.style_placeholder')}
                      value={formData.style}
                      onChange={e => setFormData({ ...formData, style: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 flex flex-col">
                    <label id="label-prims" className="text-sm font-semibold text-gray-700 ml-1">
                      {t('pricing.order_form.prims_label')}
                    </label>
                    <input
                      id="input-prims"
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                      placeholder={t('pricing.order_form.prims_placeholder')}
                      value={formData.prims_available}
                      onChange={e => setFormData({ ...formData, prims_available: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <label id="label-deadline" className="text-sm font-semibold text-gray-700 ml-1">
                      {t('pricing.order_form.deadline_label')}
                    </label>
                    <input
                      id="input-deadline"
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                      placeholder={t('pricing.order_form.deadline_placeholder')}
                      value={formData.deadline}
                      onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label id="label-details" className="text-sm font-semibold text-gray-700 ml-1">
                    {t('pricing.order_form.message_label')}
                  </label>
                  <textarea
                    id="textarea-details"
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none placeholder:text-gray-400 text-gray-900"
                    placeholder={t('pricing.order_form.message_placeholder')}
                    value={formData.details}
                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                  />
                </div>

                <button
                  id="submit-order-form-btn"
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-gray-200"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {t('pricing.order_form.submit_btn')}
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                id="order-success-msg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">{t('pricing.order_form.success_msg')}</h3>
                  <p className="text-gray-500 text-sm">You can close this window now.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
