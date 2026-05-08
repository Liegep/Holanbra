import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';
import { ToastType } from '../Toast';

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

  const handleSave = async () => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 'site_links', ...settings });

    if (error) {
      showToast("Error saving links", "error");
    } else {
      showToast("Links saved successfully", "success");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white uppercase tracking-widest">Site Links Configuration</h2>
      <div className="grid grid-cols-1 gap-6 bg-zinc-900 p-6 rounded-2xl border border-white/10">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs font-bold text-gray-400 border-l-2 border-amber-500 pl-2 uppercase tracking-widest mb-2">
              {key.replace(/_/g, ' ')}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        ))}
        <button
          onClick={handleSave}
          className="w-full bg-amber-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
};
