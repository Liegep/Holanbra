import React from 'react';
import { 
  User as UserIcon, 
  Save, 
  Trash2, 
  ChevronRight, 
  Image as ImageIcon 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminTeamManagerProps {
  teamMembers: any[];
  teamFormData: any;
  setTeamFormData: (val: any | ((prev: any) => any)) => void;
  editingTeamId: string | null;
  setEditingTeamId: (id: string | null) => void;
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target: string) => void;
  handleSaveTeam: () => void;
  handleDeleteTeam: (id: string) => void;
  handleEditTeam: (member: any) => void;
}

export function AdminTeamManager({
  teamMembers,
  teamFormData,
  setTeamFormData,
  editingTeamId,
  setEditingTeamId,
  isUploading,
  handleFileUpload,
  handleSaveTeam,
  handleDeleteTeam,
  handleEditTeam
}: AdminTeamManagerProps) {
  const { t } = useTranslation();

  const handleTeamInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeamFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold font-display text-left text-white">{t('team_management')}</h3>
        <button 
          onClick={() => {
            setEditingTeamId(null);
            setTeamFormData({
              name: '',
              role: '',
              bio: '',
              image: '',
              icon: 'Users',
              slProfile: '#',
              order: (teamMembers.length + 1).toString()
            });
          }}
          className="text-[10px] font-black uppercase text-amber-500 tracking-widest hover:underline"
        >
          {t('reset_form')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-amber-500/70 uppercase">{t('member_name')}</label>
              <input 
                type="text"
                name="name"
                value={teamFormData.name}
                onChange={handleTeamInputChange}
                className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                placeholder="Ymir Coronet"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase">{t('member_role')}</label>
              <input 
                type="text"
                name="role"
                value={teamFormData.role}
                onChange={handleTeamInputChange}
                className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                placeholder="Founder & Architect"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('member_icon')}</label>
                <select 
                  name="icon"
                  value={teamFormData.icon}
                  onChange={handleTeamInputChange}
                  className="w-full glass-card bg-zinc-900 border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white appearance-none"
                >
                  <option value="Briefcase">Briefcase</option>
                  <option value="Paintbrush">Paintbrush</option>
                  <option value="ShieldCheck">Shield</option>
                  <option value="Scale">Legal</option>
                  <option value="Users">Community</option>
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-gray-500 uppercase">{t('member_order')}</label>
                <input 
                  type="number"
                  name="order"
                  value={teamFormData.order}
                  onChange={handleTeamInputChange}
                  className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                />
              </div>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase">{t('member_sl_profile')}</label>
              <input 
                type="text"
                name="slProfile"
                value={teamFormData.slProfile}
                onChange={handleTeamInputChange}
                className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                placeholder="#"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-gray-500 uppercase">{t('member_bio')}</label>
              <textarea 
                name="bio"
                value={teamFormData.bio}
                onChange={handleTeamInputChange}
                rows={4}
                className="w-full glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white"
                placeholder="Short biography..."
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-gray-500 uppercase">{t('portrait_photo')}</label>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input 
                  type="text"
                  name="image"
                  value={teamFormData.image}
                  onChange={handleTeamInputChange}
                  className="flex-1 glass-card bg-transparent border-white/10 p-4 text-sm focus:border-amber-500 outline-none text-white shadow-inner"
                  placeholder={t('paste_url_or_upload')}
                />
                <label className="shrink-0 flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={isUploading}
                  />
                  <ImageIcon className="text-gray-500 group-hover:text-white" size={20} />
                </label>
              </div>
              {teamFormData.image && (
                <div className="aspect-[4/5] w-32 rounded-xl overflow-hidden border border-white/10 mx-auto">
                   <img src={teamFormData.image} alt="Team Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleSaveTeam}
            className="w-full py-5 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-amber-500 transition-all uppercase tracking-widest text-xs"
          >
            <Save size={18} /> {editingTeamId ? t('update_member') : t('add_to_team')}
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-500 uppercase block text-left">{t('current_team')}</label>
          <div className="grid gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="glass-card p-4 flex items-center gap-4 group">
                <div className="w-12 h-16 rounded-lg bg-white/10 overflow-hidden shrink-0">
                  <img src={member.photo_url || member.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h4 className="font-bold text-sm truncate text-white">{member.name}</h4>
                  <div className="flex items-center gap-2">
                     <p className="text-[10px] text-amber-500/60 uppercase tracking-widest truncate">{member.role}</p>
                     <span className="text-[8px] text-white/20 font-black">#{member.display_order}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditTeam(member)}
                    className="p-2 text-gray-500 hover:text-white"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTeam(member.id)}
                    className="p-2 text-red-500/30 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
