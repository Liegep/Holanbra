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
import { Link, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Find the element with the ID from hash
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      
      if (element) {
        // Use a small timeout to ensure the DOM is ready and any layout shifts have occurred
        const timeoutId = setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          
          // Double check scroll after a bit more time because of image loads
          setTimeout(() => {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 300);
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    } else if (location.pathname === '/' || location.pathname === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen selection:bg-amber-500/30 selection:text-amber-200 bg-background-dark text-white">
      <ScrollToTop />
      <Navbar />
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
          <Route path="/admin/*" element={<AdminArea />} />
          <Route path="/resident/*" element={<ResidentDashboard />} />
          <Route path="/properties" element={
            <div className="pt-20">
              <Properties />
            </div>
          } />
          <Route path="/covenant" element={<Covenant />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <TeleportCTA />
      <TawkChat />
      <Footer />
    </div>
  );
}
