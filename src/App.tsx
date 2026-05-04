import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  MessageSquare, 
  User as Admin, 
  MapPin, 
  LogOut, 
  Layers, 
  Phone, 
  Mail,
  Zap,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { Link, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Properties from './components/Properties';
import Gallery from './components/Gallery';
import QuoteSection from './components/QuoteSection';
import AboutUs from './components/AboutUs';
import Decoration from './components/Decoration';
import Pricing from './components/Pricing';
import Team from './components/Team';
import AdminArea from './components/AdminArea';
import Covenant from './components/Covenant';
import ResidentDashboard from './components/ResidentDashboard';
import Portfolio from './components/Portfolio';
import TawkChat from './components/TawkChat';
import TeleportCTA from './components/TeleportCTA';
import Footer from './components/Footer';
import { SUPPORTED_LANGS } from './i18n';

function LanguageRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    const browserLang = navigator.language.split('-')[0];
    const defaultLang = savedLang || (SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en');
    
    navigate(`/${defaultLang}`, { replace: true });
  }, [navigate]);

  return null;
}

function LanguageWrapper() {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    const browserLang = navigator.language.split('-')[0];
    const targetLang = savedLang || (SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en');

    if (lang && SUPPORTED_LANGS.includes(lang)) {
      // Check if we are trying to access admin or resident via localized path
      const subPath = location.pathname.split('/').slice(2).join('/');
      if (subPath === 'admin' || subPath.startsWith('admin/') || subPath === 'resident' || subPath.startsWith('resident/')) {
        navigate(`/${subPath}`, { replace: true });
        return;
      }

      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
      }
    } else {
      // Case: No lang prefix (/portfolio) or invalid lang prefix (/abc/portfolio)
      // We should prepend or replace with the targetLang
      
      const pathParts = location.pathname.split('/');
      // If the first part is a known route name but not a lang, or just an unknown word
      // we'll assume it's part of the path and prefix it.
      // If it looks like a 2-char string that isn't supported, we replace it.
      
      if (lang && lang.length === 2 && !SUPPORTED_LANGS.includes(lang)) {
        // Looks like a language code but not one we support (e.g. /fr/...)
        pathParts[1] = targetLang;
      } else {
        // Not a lang code (e.g. /portfolio or /)
        pathParts.splice(1, 0, targetLang);
      }
      
      const newPath = pathParts.join('/') || `/${targetLang}`;
      navigate(newPath + location.search + location.hash, { replace: true });
    }
  }, [lang, i18n, navigate, location]);

  return (
    <>
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Properties />
              <Gallery />
              <QuoteSection />
              <AboutUs />
              <Decoration />
              <Pricing />
              <Team />
            </>
          } />
          <Route path="properties" element={
            <div className="pt-20">
              <Properties />
            </div>
          } />
          <Route path="covenant" element={<Covenant />} />
          <Route path="portfolio" element={<Portfolio />} />
        </Routes>
      </main>
      <TeleportCTA />
    </>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]); // Only scroll to top on path change

  return (
    <div className="min-h-screen selection:bg-amber-500/30 selection:text-amber-200 bg-background-dark text-white">
      <Navbar />
      <Routes>
        <Route path="/admin/*" element={<AdminArea />} />
        <Route path="/resident/*" element={<ResidentDashboard />} />
        <Route path="/" element={<LanguageRedirect />} />
        <Route path="/:lang/*" element={<LanguageWrapper />} />
        {/* Fallback for static assets or other routes if needed */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TawkChat />
      <Footer />
    </div>
  );
}
