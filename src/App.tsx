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
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Properties from './components/Properties';
import Gallery from './components/Gallery';
import QuoteSection from './components/QuoteSection';
import AboutUs from './components/AboutUs';
import Decoration from './components/Decoration';
import Team from './components/Team';
import AdminArea from './components/AdminArea';
import Covenant from './components/Covenant';
import ResidentDashboard from './components/ResidentDashboard';
import TawkChat from './components/TawkChat';
import TeleportCTA from './components/TeleportCTA';
import Footer from './components/Footer';

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
  }, [location]);

  return (
    <div className="min-h-screen selection:bg-amber-500/30 selection:text-amber-200 bg-background-dark text-white">
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
              <Team />
            </>
          } />
          <Route path="/admin/*" element={<AdminArea />} />
          <Route path="/covenant" element={<Covenant />} />
          <Route path="/resident" element={<ResidentDashboard />} />
        </Routes>
      </main>

      <TeleportCTA />
      <Footer />
      <TawkChat />
    </div>
  );
}
