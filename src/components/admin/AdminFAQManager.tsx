import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  HelpCircle,
  GripVertical,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Languages,
  Eye,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnStrikeThrough, BtnLink, BtnBulletList, BtnNumberedList, BtnClearFormatting, BtnUndo, BtnRedo, BtnUnderline, BtnStyles, BtnStrikeThrough as BtnStrike } from 'react-simple-wysiwyg';
import ReactMarkdown from 'react-markdown';

const GUIDE_TEMPLATES = {
  pt: {
    question: "Como colocar seu grupo no terreno",
    answer: `<h3><b>Como colocar seu grupo no terreno</b></h3><p>Quando você compra um terreno em Second Life, você pode definir qual grupo terá controle sobre aquele espaço.</p><h4><b>Isso é importante para:</b></h4><ul><li>Usar o terreno com amigos</li><li>Permitir rez objects</li><li>Configurar segurança</li><li>Usar tags de grupo</li><li>Dividir permissões</li><li>Evitar problemas com auto return</li></ul><hr /><h3>✨ <b>Passo a passo simples</b></h3><h4><b>1. Ative o grupo desejado</b></h4><p>Antes de tudo:</p><ul><li>Abra seu perfil de grupos</li><li>Escolha o grupo que deseja usar</li><li>Clique em “Activate”</li></ul><blockquote><i>👉 O grupo precisa estar ativo para aparecer nas opções do terreno.</i></blockquote><h4><b>2. Abra as configurações do terreno</b></h4><p>No terreno:</p><ul><li>Clique com o botão direito no chão</li><li>Vá em <b>About Land</b></li></ul><h4><b>3. Vá até a aba “General”</b></h4><p>Dentro de About Land:</p><ul><li>Procure a opção <b>Group</b></li><li>Clique em <b>Set</b></li></ul><h4><b>4. Escolha o grupo</b></h4><p>Selecione o grupo desejado e confirme. <b>Pronto ✨</b></p><p>Seu terreno agora está associado ao grupo escolhido.</p><hr /><h4>🔐 <b>Por que isso é importante?</b></h4><p>Sem configurar um grupo:</p><ul><li>Amigos podem não conseguir rezar objetos</li><li>Sistemas de segurança podem não funcionar corretamente</li><li>Scripts podem ter limitações</li><li>Parceiros/colegas não terão permissões adequadas</li></ul><h4>👥 <b>Quero dividir o terreno com alguém. Como faço?</b></h4><p>Você pode:</p><ul><li>Adicionar pessoas ao grupo</li><li>Dar permissões específicas</li><li>Permitir que membros do grupo rezem objetos</li><li>Compartilhar acesso sem precisar transferir o terreno</li></ul><blockquote><b>⚠️ Dica importante</b><br>Sempre confira:<ul><li>se o grupo está <b>ATIVO</b> antes de configurar</li><li>se as permissões do terreno estão corretas</li><li>se o “Allow Group Object Entry” está habilitado quando necessário</li></ul></blockquote>`
  },
  en: {
    question: "How to set a group on your land",
    answer: `<h3><b>How to set a group on your land</b></h3><p>When you purchase land in Second Life, you can assign a group to your property.</p><h4><b>This is important for:</b></h4><ul><li>sharing the land with friends</li><li>allowing object rezzing</li><li>configuring security systems</li><li>using group tags</li><li>managing permissions</li><li>avoiding auto-return issues</li></ul><hr /><h3>✨ <b>Simple step-by-step</b></h3><h4><b>1. Activate the desired group</b></h4><p>First:</p><ul><li>Open your Groups panel</li><li>Select the group you want to use</li><li>Click “Activate”</li></ul><blockquote><i>👉 The group must be active before it can be assigned to the land.</i></blockquote><h4><b>2. Open land settings</b></h4><p>While standing on your land:</p><ul><li>Right-click the ground</li><li>Select <b>About Land</b></li></ul><h4><b>3. Go to the “General” tab</b></h4><p>Inside About Land:<ul><li>Find the <b>Group</b> option</li><li>Click <b>Set</b></li></ul><h4><b>4. Choose the group</b></h4><p>Select the desired group and confirm. <b>Done ✨</b></p><p>Your land is now assigned to that group.</p><hr /><h4>🔐 <b>Why is this important?</b></h4><p>Without a group configured:<ul><li>friends may not be able to rez objects</li><li>security systems may not work properly</li><li>scripts may have restrictions</li><li>partners or collaborators may not have proper permissions</li></ul><h4>👥 <b>Want to share the land with someone?</b></h4><p>You can:<ul><li>add people to the group</li><li>assign specific permissions</li><li>allow group members to rez objects</li><li>share access without transferring ownership</li></ul><blockquote><b>⚠️ Important tip</b><br>Always check:<ul><li>if the correct group is <b>ACTIVE</b></li><li>if land permissions are configured properly</li><li>if “Allow Group Object Entry” is enabled when enabled</li></ul></blockquote>`
  },
  es: {
    question: "Cómo colocar un grupo en tu terreno",
    answer: `<h3><b>Cómo colocar un grupo en tu terreno</b></h3><p>Cuando compras un terreno en Second Life, puedes asignar un grupo a tu propiedad.</p><h4><b>Esto es importante para:</b></h4><ul><li>compartir el terreno con amigos</li><li>permitir rez de objetos</li><li>configurar sistemas de seguridad</li><li>usar etiquetas de grupo</li><li>administrar permisos</li><li>evitar problemas de auto return</li></ul><hr /><h3>✨ <b>Paso a paso sencillo</b></h3><h4><b>1. Activa el grupo deseado</b></h4><p>Primero:</p><ul><li>Abre tu panel de grupos</li><li>Selecciona el grupo que deseas usar</li><li>Haz clic en “Activate”</li></ul><blockquote><i>👉 El grupo debe estar activo antes de asignarlo al terreno.</i></blockquote><h4><b>2. Abre la configuración del terreno</b></h4><p>Estando sobre el terreno:</p><ul><li>Haz clic derecho sobre el suelo</li><li>Selecciona <b>About Land</b></li></ul><h4><b>3. Ve a la pestaña “General”</b></h4><p>Dentro de About Land:<ul><li>Busca la opción <b>Group</b></li><li>Haz clic en <b>Set</b></li></ul><h4><b>4. Elige el grupo</b></h4><p>Selecciona el grupo deseado y confirma. <b>Listo ✨</b></p><p>Tu terreno ahora está asignado a ese grupo.</p><hr /><h4>🔐 <b>¿Por qué es importante?</b></h4><p>Sin un grupo configurado:<ul><li>tus amigos pueden no poder rezar objetos</li><li>los sistemas de seguridad pueden no funcionar correctamente</li><li>algunos scripts pueden tener restricciones</li><li>socios o colaboradores pueden no tener permisos adecuados</li></ul><h4>👥 <b>¿Quieres compartir el terreno con alguien?</b></h4><p>Puedes:<ul><li>agregar personas al grupo</li><li>asignar permisos específicos</li><li>permitir que miembros del grupo rezen objetos</li><li>compartir acceso sin transferir la propiedad</li></ul><blockquote><b>⚠️ Consejo importante</b><br>Siempre verifica:<ul><li>que el grupo correcto esté <b>ACTIVO</b></li><li>que los permisos del terreno estén bien configurados</li><li>que “Allow Group Object Entry” esté habilitado cuando sea necesario</li></ul></blockquote>`
  },
  nl: {
    question: "Hoe stel je een groep in op je terrein",
    answer: `<h3><b>Hoe stel je een groep in op je terrein</b></h3><p>Wanneer je een terrein koopt in Second Life, kun je een groep koppelen aan je perceel.</p><h4><b>Dit is belangrijk om:</b></h4><ul><li>het terrein met vrienden te delen</li><li>objecten te kunnen rezz’en</li><li>beveiligingssystemen in te stellen</li><li>groepstags te gebruiken</li><li>rechten te beheren</li><li>problemen met auto-return te voorkomen</li></ul><hr /><h3>✨ <b>Eenvoudige stap-voor-stap uitleg</b></h3><h4><b>1. Activeer de gewenste groep</b></h4><p>Eerst:</p><ul><li>Open je Groups-venster</li><li>Selecteer de groep die je wilt gebruiken</li><li>Klik op “Activate”</li></ul><blockquote><i>👉 De groep moet actief zijn voordat je deze aan het terrein kunt koppelen.</i></blockquote><h4><b>2. Open de terreininstellingen</b></h4><p>Terwijl je op het terrein staat:</p><ul><li>Klik met de rechtermuisknop op de grond</li><li>Kies <b>About Land</b></li></ul><h4><b>3. Ga naar het tabblad “General”</b></h4><p>Binnen About Land:<ul><li>Zoek de optie <b>Group</b></li><li>Klik op <b>Set</b></li></ul><h4><b>4. Kies de groep</b></h4><p>Selecteer de gewenste groep en bevestig. <b>Klaar ✨</b></p><p>Je terrein is nu gekoppeld aan die groep.</p><hr /><h4>🔐 <b>Waarom is dit belangrijk?</b></h4><p>Zonder een groep ingesteld:<ul><li>vrienden kunnen mogelijk geen objecten rezz’en</li><li>beveiligingssystemen werken mogelijk niet correct</li><li>scripts kunnen beperkt zijn</li><li>partners of medewerkers hebben mogelijk geen juiste rechten</li></ul><h4>👥 <b>Wil je het terrein delen met iemand?</b></h4><p>Zonder een groep ingesteld:<ul><li>mensen toevoegen aan de groep</li><li>specifieke rechten geven</li><li>groepsleden toestaan objecten te rezz’en</li><li>toegang delen zonder eigendom over te dragen</li></ul><blockquote><b>⚠️ Belangrijke tip</b><br>Controleer altijd:<ul><li>of de juiste groep ACTIEF staat</li><li>of de terreinrechten correct zijn ingesteld</li><li>of “Allow Group Object Entry” is ingeschakeld indien nodig</li></ul></blockquote>`
  }
};

const BLANK_STRUCTURE = {
  pt: {
    question: "Título do Novo Guia",
    answer: `<h3><b>Título do Assunto Principal</b></h3><p>Introdução curta explicando do que se trata este guia.</p><hr /><h3>✨ <b>Instruções Passo a Passo</b></h3><h4><b>1. Primeira Etapa</b></h4><ul><li>Ação um</li><li>Ação dois</li></ul><h4><b>2. Segunda Etapa</b></h4><p>Detalhes sobre a segunda fase do processo.</p><hr /><h4>🔐 <b>Avisos Importantes e Segurança</b></h4><blockquote><b>⚠️ Dica de Especialista:</b> Um conselho contextual ou aviso importante vai aqui dentro do balão.</blockquote><ul><li>Ponto de verificação</li><li>Erro comum a evitar</li></ul>`
  },
  en: {
    question: "New Guide Title",
    answer: `<h3><b>Main Topic Title</b></h3><p>Short intro explaining what this guide is about.</p><hr /><h3>✨ <b>Step-by-Step Instructions</b></h3><h4><b>1. First Step</b></h4><ul><li>Action one</li><li>Action two</li></ul><h4><b>2. Second Step</b></h4><p>Details about the second stage of the process.</p><hr /><h4>🔐 <b>Important Notices & Security</b></h4><blockquote><b>⚠️ Pro Tip:</b> Contextual advice or important warning goes inside this bubble.</blockquote><ul><li>Check point</li><li>Common pitfall to avoid</li></ul>`
  },
  es: {
    question: "Título del Nuevo Guía",
    answer: `<h3><b>Título del Tema Principal</b></h3><p>Introducción breve explicando de qué se trata esta guía.</p><hr /><h3>✨ <b>Instrucciones Paso a Paso</b></h3><h4><b>1. Primer Paso</b></h4><ul><li>Acción uno</li><li>Acción dos</li></ul><h4><b>2. Segundo Paso</b></h4><p>Detalles sobre la segunda etapa del proceso.</p><hr /><h4>🔐 <b>Avisos Importantes y Seguridad</b></h4><blockquote><b>⚠️ Consejo de Experto:</b> Un consejo contextual o aviso importante va aquí dentro del globo.</blockquote><ul><li>Punto de verificación</li><li>Error común a evitar</li></ul>`
  },
  nl: {
    question: "Nieuwe Gidstitel",
    answer: `<h3><b>Hoofdonderwerp Titel</b></h3><p>Korte inleiding die uitlegt waar deze gids over gaat.</p><hr /><h3>✨ <b>Stap-voor-stap Instructies</b></h3><h4><b>1. Eerste Stap</b></h4><ul><li>Actie één</li><li>Actie twee</li></ul><h4><b>2. Tweede Stap</b></h4><p>Details over de tweede fase van het proces.</p><hr /><h4>🔐 <b>Belangrijke Mededelingen & Veiligheid</b></h4><blockquote><b>⚠️ Pro Tip:</b> Contextueel advies of een belangrijke waarschuwing komt hier in deze tekstballon.</blockquote><ul><li>Controlepunt</li><li>Veelvoorkomende valkuil om te vermijden</li></ul>`
  }
};

interface GuideStep {
  title: string;
  content: string;
}

interface StructuredAnswer {
  type: 'structured';
  intro: string;
  steps: GuideStep[];
  footer: string;
  expertTip: string;
}

const INITIAL_STRUCTURED: StructuredAnswer = {
  type: 'structured',
  intro: '',
  steps: [{ title: '', content: '' }],
  footer: '',
  expertTip: ''
};

interface FAQ {
  id: string;
  category: string;
  display_order: number;
  question_en: string;
  answer_en: string;
  question_pt: string;
  answer_pt: string;
  question_es: string;
  answer_es: string;
  question_nl: string;
  answer_nl: string;
}

const INITIAL_FAQ: Omit<FAQ, 'id'> = {
  category: 'technical',
  display_order: 0,
  question_en: '',
  answer_en: '',
  question_pt: '',
  answer_pt: '',
  question_es: '',
  answer_es: '',
  question_nl: '',
  answer_nl: ''
};

export const AdminFAQManager: React.FC = () => {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<FAQ, 'id'>>(INITIAL_FAQ);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLang, setActiveLang] = useState<'en' | 'pt' | 'es' | 'nl'>('en');
  const [showPreview, setShowPreview] = useState(false);
  const [useStructured, setUseStructured] = useState<Record<string, boolean>>({
    en: false, pt: false, es: false, nl: false
  });

  const getStructuredData = (lang: string): StructuredAnswer => {
    const raw = formData[`answer_${lang}` as keyof typeof formData] as string;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.type === 'structured') return parsed;
    } catch (e) {}
    return { ...INITIAL_STRUCTURED };
  };

  const updateStructuredData = (lang: string, data: Partial<StructuredAnswer>) => {
    const current = getStructuredData(lang);
    const updated = { ...current, ...data };
    setFormData({
      ...formData,
      [`answer_${lang}`]: JSON.stringify(updated)
    });
  };

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    
    // Auto-detect structured mode for each language
    const structuredState = {
      en: false, pt: false, es: false, nl: false
    };
    
    (['en', 'pt', 'es', 'nl'] as const).forEach(lang => {
      try {
        const val = faq[`answer_${lang}`];
        const parsed = JSON.parse(val);
        if (parsed && parsed.type === 'structured') {
          structuredState[lang] = true;
        }
      } catch (e) {}
    });
    
    setUseStructured(structuredState);

    setFormData({
      category: faq.category,
      display_order: faq.display_order,
      question_en: faq.question_en,
      answer_en: faq.answer_en,
      question_pt: faq.question_pt,
      answer_pt: faq.answer_pt,
      question_es: faq.question_es,
      answer_es: faq.answer_es,
      question_nl: faq.question_nl,
      answer_nl: faq.answer_nl
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(INITIAL_FAQ);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([formData]);
        if (error) throw error;
      }
      
      setFormData(INITIAL_FAQ);
      setEditingId(null);
      fetchFAQs();
    } catch (err: any) {
      console.error('Error saving FAQ:', err);
      alert(t('admin.common.error.generic') + ': ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.faqs.delete_confirm'))) return;
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchFAQs();
    } catch (err) {
      console.error('Error deleting FAQ:', err);
    }
  };

  const moveOrder = async (id: string, currentOrder: number, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    // Simple order swap logic could be added here
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ display_order: newOrder })
        .eq('id', id);
      if (error) throw error;
      fetchFAQs();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-8 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
            <HelpCircle size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">{t('admin.faqs.title')}</h2>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">{t('admin.faqs.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* FAQ Form */}
      <div className="glass-card p-8 border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-amber-500 ml-1">{t('admin.faqs.category')}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50"
              >
                <option value="technical" className="bg-zinc-900">{t('admin.faqs.categories.technical')}</option>
                <option value="land" className="bg-zinc-900">{t('admin.faqs.categories.land')}</option>
                <option value="billing" className="bg-zinc-900">{t('admin.faqs.categories.billing')}</option>
                <option value="others" className="bg-zinc-900">{t('admin.faqs.categories.others')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-amber-500 ml-1">{t('admin.faqs.order')}</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl self-start">
            {(['en', 'pt', 'es', 'nl'] as const).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeLang === lang ? "bg-amber-500 text-black" : "text-white/40 hover:text-white"
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase text-white/40">
                  {t('admin.faqs.editor_mode', 'Editor Mode')}
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={useStructured[activeLang]}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setUseStructured(prev => ({ ...prev, [activeLang]: enabled }));
                      
                      // If switching to structured, initialize it with current content if possible or blank
                      if (enabled) {
                        const current = formData[`answer_${activeLang}` as keyof typeof formData] as string;
                        try {
                          const parsed = JSON.parse(current);
                          if (!parsed || parsed.type !== 'structured') throw new Error();
                        } catch (e) {
                          // Only set default structured if it wasn't already structured JSON
                          setFormData({
                            ...formData,
                            [`answer_${activeLang}`]: JSON.stringify({
                              ...INITIAL_STRUCTURED,
                              intro: current // keep old content as intro
                            })
                          });
                        }
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-white/5 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                    {useStructured[activeLang] ? t('admin.faqs.structured_mode', 'Guide Builder') : t('admin.faqs.simple_mode', 'Rich Text')}
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-amber-500 ml-1">
                {t('admin.faqs.question_label')} ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData[`question_${activeLang}` as keyof typeof formData] as string}
                onChange={(e) => setFormData({ ...formData, [`question_${activeLang}`]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50"
                placeholder={t('admin.faqs.question_placeholder')}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase text-amber-500">
                  {t('admin.faqs.answer_label')} ({activeLang.toUpperCase()})
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                    <Info size={10} className="text-amber-500" /> Supports Markdown (* for lists, ** for bold)
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      showPreview ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-white/5 text-white/40 hover:bg-white/10"
                    )}
                  >
                    <Eye size={12} /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>
              </div>
              
              {showPreview && (
                <div className="p-8 bg-[#0a0a0a] border border-amber-500/20 rounded-3xl mb-6 relative overflow-hidden group/preview">
                  <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/preview:opacity-100 transition-opacity">
                    <div className="px-2 py-1 bg-amber-500 text-black text-[8px] font-black uppercase rounded">Preview Mode</div>
                  </div>
                  <div className="rich-content faq-rich-content">
                    {useStructured[activeLang] ? (
                      (() => {
                        const data = getStructuredData(activeLang);
                        return (
                          <div className="space-y-8">
                            {data.intro && <ReactMarkdown>{data.intro}</ReactMarkdown>}
                            <div className="space-y-6">
                              {data.steps.map((step, idx) => (
                                <div key={idx} className="relative pl-12 border-l border-white/5 pb-2">
                                  <div className="absolute left-[-17px] top-0 w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs">
                                    {idx + 1}
                                  </div>
                                  <h5 className="text-lg font-bold text-amber-500 mb-2">{step.title || 'Step ' + (idx + 1)}</h5>
                                  <ReactMarkdown>{step.content}</ReactMarkdown>
                                </div>
                              ))}
                            </div>
                            {data.footer && <div className="pt-6 border-t border-white/5 opacity-60 italic"><ReactMarkdown>{data.footer}</ReactMarkdown></div>}
                            {data.expertTip && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 italic">
                                    <ReactMarkdown>{'**Expert Tip:** ' + data.expertTip}</ReactMarkdown>
                                </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <ReactMarkdown>{formData[`answer_${activeLang}` as keyof typeof formData] as string}</ReactMarkdown>
                    )}
                  </div>
                </div>
              )}
              {useStructured[activeLang] ? (
                <div className="space-y-8 p-8 bg-black/40 rounded-3xl border border-white/5 shadow-2xl relative">
                  {/* Structured Builder UI */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-1">Introduction</label>
                    <textarea
                      value={getStructuredData(activeLang).intro}
                      onChange={(e) => updateStructuredData(activeLang, { intro: e.target.value })}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50 resize-none text-sm"
                      placeholder="Write a short introduction..."
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="sticky top-0 z-30 py-4 mb-4 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 -mx-8 px-8 flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-white/40 ml-1">Steps / Instructions</label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = getStructuredData(activeLang);
                          updateStructuredData(activeLang, {
                            steps: [...current.steps, { title: '', content: '' }]
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                      >
                        <Plus size={14} /> Add Step
                      </button>
                    </div>

                    <div className="space-y-4">
                      {getStructuredData(activeLang).steps.map((step, idx) => (
                        <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4 group">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-amber-500/50">Step {idx + 1}</span>
                            {getStructuredData(activeLang).steps.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const current = getStructuredData(activeLang);
                                  updateStructuredData(activeLang, {
                                    steps: current.steps.filter((_, i) => i !== idx)
                                  });
                                }}
                                className="text-white/10 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => {
                              const current = getStructuredData(activeLang);
                              const newSteps = [...current.steps];
                              newSteps[idx].title = e.target.value;
                              updateStructuredData(activeLang, { steps: newSteps });
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50 text-sm font-bold"
                            placeholder={`Step ${idx + 1} Title`}
                          />
                          <textarea
                            value={step.content}
                            onChange={(e) => {
                              const current = getStructuredData(activeLang);
                              const newSteps = [...current.steps];
                              newSteps[idx].content = e.target.value;
                              updateStructuredData(activeLang, { steps: newSteps });
                            }}
                            rows={3}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50 resize-none text-sm"
                            placeholder="Describe what needs to be done..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-amber-500 ml-1">Important Notices (Footer)</label>
                      <textarea
                        value={getStructuredData(activeLang).footer}
                        onChange={(e) => updateStructuredData(activeLang, { footer: e.target.value })}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50 resize-none text-sm"
                        placeholder="General warnings or additional info..."
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-emerald-500 ml-1">Expert Tip (Bubble)</label>
                      <textarea
                        value={getStructuredData(activeLang).expertTip}
                        onChange={(e) => updateStructuredData(activeLang, { expertTip: e.target.value })}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amber-500/50 resize-none text-sm italic"
                        placeholder="Specific advice to highlight..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                  <EditorProvider>
                    <Editor
                      value={formData[`answer_${activeLang}` as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [`answer_${activeLang}`]: e.target.value })}
                      placeholder={t('admin.faqs.answer_placeholder')}
                      className="min-h-[300px] text-white"
                    >
                      <Toolbar>
                        <BtnUndo />
                        <BtnRedo />
                        <BtnStyles />
                        <BtnBold />
                        <BtnItalic />
                        <BtnUnderline />
                        <BtnLink />
                        <BtnBulletList />
                        <BtnNumberedList />
                        <BtnClearFormatting />
                      </Toolbar>
                    </Editor>
                  </EditorProvider>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl",
                editingId ? "bg-white text-black hover:bg-amber-400" : "bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20"
              )}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : editingId ? (
                <Save size={16} />
              ) : (
                <Plus size={16} />
              )}
              {editingId ? t('admin.common.save') : t('admin.faqs.create_new')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-4 bg-white/5 text-white/40 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all"
              >
                <X size={16} /> {t('admin.common.cancel')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List of FAQs */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 border-white/5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1 items-center">
                  <button onClick={() => moveOrder(faq.id, faq.display_order, 'up')} className="text-white/20 hover:text-amber-500 transition-colors">
                    <ChevronUp size={16} />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-amber-500/50">{faq.display_order}</span>
                  <button onClick={() => moveOrder(faq.id, faq.display_order, 'down')} className="text-white/20 hover:text-amber-500 transition-colors">
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                      faq.category === 'technical' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      faq.category === 'land' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      faq.category === 'billing' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {t(`admin.faqs.categories.${faq.category}`)}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{faq.question_en}</h4>
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-[6px] font-black uppercase text-white/20 w-4">Q:</span>
                      {(['en', 'pt', 'es', 'nl'] as const).map(lang => (
                        <div 
                          key={lang}
                          title={`Question ${lang.toUpperCase()}`}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            faq[`question_${lang}`] ? "bg-amber-500" : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-[6px] font-black uppercase text-white/20 w-4">A:</span>
                      {(['en', 'pt', 'es', 'nl'] as const).map(lang => (
                        <div 
                          key={lang}
                          title={`Answer ${lang.toUpperCase()}`}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            faq[`answer_${lang}`] ? "bg-amber-500" : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-white hover:text-black transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {faqs.length === 0 && !loading && (
          <div className="glass-card p-12 text-center border-dashed border-white/5">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">{t('admin.common.no_items')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
