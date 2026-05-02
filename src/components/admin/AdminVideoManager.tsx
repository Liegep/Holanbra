import React from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  Plus, 
  Play, 
  Trash2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminVideoManagerProps {
  videos: any[];
  isUploading: boolean;
  isUploadingSlot: string | null;
  handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteVideo: (id: number) => void;
}

export function AdminVideoManager({
  videos,
  isUploading,
  isUploadingSlot,
  handleVideoUpload,
  handleDeleteVideo
}: AdminVideoManagerProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl space-y-12">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h2 className="text-3xl font-bold font-display text-white">{t('video_management')}</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-2">{t('video_management_desc')}</p>
        </div>
        
        <label className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all cursor-pointer flex items-center gap-2">
          <Plus size={16} />
          <input 
            type="file" 
            className="hidden" 
            accept="video/*" 
            onChange={handleVideoUpload}
            disabled={isUploading}
          />
          {isUploading ? t('uploading_video') : t('upload_video')}
        </label>
      </div>

      {isUploading && isUploadingSlot === 'videos' && (
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 15, ease: "linear" }}
            className="h-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
          />
          <p className="text-[8px] text-white/40 uppercase tracking-[0.2em] mt-2 text-right">{t('uploading_high_quality_desc')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid) => (
          <div key={vid.id} className="glass-card group p-4 border-white/5 flex flex-col gap-4 overflow-hidden">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group">
              <video src={vid.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => window.open(vid.url, '_blank')}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Play size={16} fill="black" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-2 pb-2">
              <div className="text-left min-w-0">
                <p className="text-[10px] font-bold text-white truncate uppercase tracking-wider">{vid.name}</p>
                <p className="text-[8px] text-white/30 font-mono mt-1">{new Date(vid.created_at).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => handleDeleteVideo(vid.id)}
                className="p-2 text-white/20 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">{t('no_videos_uploaded')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
