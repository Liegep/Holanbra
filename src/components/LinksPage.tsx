import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Facebook, Home, FileText, Paintbrush, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function LinksPage() {
  const { t } = useTranslation();

  const links = [
    { name: t('links_page.site', 'Official Site'), url: 'https://www.holanbra.com', icon: Globe },
    { name: t('links_page.facebook', 'Facebook'), url: 'https://www.facebook.com/holanbrasims/', icon: Facebook },
    { name: t('links_page.properties', 'Find your home'), url: 'https://holanbra.com/#properties', icon: Home },
    { name: t('links_page.covenant', 'Covenant'), url: 'https://holanbra.com/covenant', icon: FileText },
    { name: t('links_page.decoration', 'Decoration Services'), url: 'https://holanbra.com/#services', icon: Paintbrush },
    { name: t('links_page.team', 'Our Team'), url: 'https://holanbra.com/#team', icon: Users },
  ];

  return (
    <div className="min-h-screen pt-32 px-6 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-950 p-8 rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center -rotate-6 shadow-[0_0_30px_rgba(247,203,69,0.3)] mb-4">
            <span className="text-black font-black text-3xl">H</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-white uppercase">{t('links_page.title', 'Holanbra Links')}</h1>
        </div>

        <div className="space-y-4">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 transition-all rounded-xl border border-white/5 text-lg font-bold text-white hover:text-amber-500"
            >
              <link.icon className="text-amber-500" />
              {link.name}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
