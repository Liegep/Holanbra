import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface SLStatus {
  status: {
    indicator: 'none' | 'minor' | 'major' | 'critical' | 'maintenance';
    description: string;
  };
  page: {
    url: string;
  };
}

export const GridStatus: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<SLStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Statuspage.io public API endpoint for Second Life
        const response = await fetch('https://status.secondlifegrid.net/api/v2/summary.json');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch SL Grid status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 opacity-50">
        <Clock size={12} className="animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{t('grid.checking')}</span>
      </div>
    );
  }

  const indicator = status?.status.indicator || 'none';
  const description = status?.status.description === 'Operational' ? t('grid.operational') : (status?.status.description || t('grid.operational'));

  const config = {
    none: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 },
    minor: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertTriangle },
    major: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', icon: AlertTriangle },
    critical: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: AlertTriangle },
    maintenance: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Activity },
  };

  const { color, bg, border, icon: Icon } = config[indicator as keyof typeof config] || config.none;

  return (
    <a 
      href={status?.page.url || 'https://status.secondlifegrid.net/'} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-1.5 ${bg} ${border} border rounded-full transition-all hover:brightness-125 group`}
    >
      <Icon size={12} className={color} />
      <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>
        {t('grid.label')}: {description}
      </span>
    </a>
  );
};
