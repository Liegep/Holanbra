import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TawkChat() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // @ts-ignore
    window.Tawk_API = window.Tawk_API || {};
    // @ts-ignore
    window.Tawk_LoadStart = new Date();

    // Hide default widget on load
    // @ts-ignore
    window.Tawk_API.onLoad = function() {
      // @ts-ignore
      window.Tawk_API.hideWidget();
      setIsLoaded(true);
    };

    (function(){
      var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/69f4c78fb402371c38a67bb1/1jni2n33k';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      } else {
        document.head.appendChild(s1);
      }
    })();
  }, []);

  const toggleChat = () => {
    // @ts-ignore
    if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
      // @ts-ignore
      window.Tawk_API.toggle();
    }
  };

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.button
          id="custom-tawk-trigger"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
          className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 bg-[#F59E0B] text-black rounded-full shadow-2xl shadow-amber-500/30 font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:bg-white border-2 border-black/5"
        >
          <MessageCircle size={18} strokeWidth={3} />
          <span>Chat ao Vivo</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
