import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface PricingPackage {
  id: string;
  name: string;
  price: string;
  features: string[];
  is_popular: boolean;
  order_idx: number;
}

const DEFAULT_PACKAGES: PricingPackage[] = [
  {
    id: '1',
    name: 'Basic Room',
    price: 'L$ 2,500',
    features: ['1 Room Decoration', 'Up to 50 prims', 'Color Palette Selection', 'Basic Lighting Setup', '1 Revision'],
    is_popular: false,
    order_idx: 1
  },
  {
    id: '2',
    name: 'Standard Home',
    price: 'L$ 7,500',
    features: ['Full House Decoration (Up to 3 rooms)', 'Up to 150 prims', 'Custom Furniture Placement', 'Advanced Lighting', 'Landscaping Layout', '2 Revisions'],
    is_popular: true,
    order_idx: 2
  },
  {
    id: '3',
    name: 'Premium Estate',
    price: 'L$ 15,000+',
    features: ['Unlimited Rooms & Landscaping', 'Priority Support', 'Full Custom Sims', 'Interactive Scripts & Decor', 'Premium Texture Matching', 'Unlimited Revisions'],
    is_popular: false,
    order_idx: 3
  }
];

export default function Pricing() {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_packages')
          .select('*')
          .order('order_idx', { ascending: true });

        if (error || !data || data.length === 0) {
          console.warn('Could not fetch pricing table or it is empty:', error);
          setPackages(DEFAULT_PACKAGES);
        } else {
          setPackages(data);
        }
      } catch (err) {
        console.error('Error fetching pricing:', err);
        setPackages(DEFAULT_PACKAGES);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handleOrder = (packageName: string) => {
    // @ts-ignore
    if (window.Tawk_API) {
      // @ts-ignore
      window.Tawk_API.maximize();
      // Wait for chat to open then prefill if method exists
      setTimeout(() => {
        // @ts-ignore
        if (window.Tawk_API.addEvent) {
          // @ts-ignore
          window.Tawk_API.addEvent('package_selected', { package: packageName });
        }
      }, 500);
      console.log(`User wants to order: ${packageName}`);
      // Alternatively, user can type it in manually since Tawk.to doesn't have a direct "pre-fill input field" API without custom forms
      alert(`Chat opening! Please tell us you're interested in the ${packageName} package.`);
    } else {
      console.warn("Tawk_API not found. Chat not loaded.");
      alert(`We would love to help you with the ${packageName} package. Please contact us in-world!`);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-[-10%] w-[40%] aspect-square bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[30%] aspect-square bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white">
            Decoration Packages
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-sm">
            Choose the perfect plan for your virtual space. We handle everything from a single room makeover to a complete estate build.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white/5 rounded-[40px] h-96 border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative bg-white/5 border rounded-[40px] p-8 flex flex-col h-full",
                  pkg.is_popular 
                    ? "border-amber-500/50 shadow-2xl shadow-amber-500/10 md:-translate-y-4 bg-gradient-to-b from-white/10 to-transparent" 
                    : "border-white/10 hover:border-white/20 transition-all"
                )}
              >
                {pkg.is_popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-black text-amber-500">{pkg.price}</span>
                </div>
                
                <div className="h-px w-full bg-white/10 mb-8" />
                
                <ul className="space-y-4 flex-1 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                        <Check size={10} className="text-amber-500" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleOrder(pkg.name)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    pkg.is_popular 
                      ? "bg-amber-500 text-black hover:bg-white shadow-lg shadow-amber-500/20" 
                      : "bg-white/10 text-white hover:bg-white hover:text-black border border-white/5"
                  )}
                >
                  <MessageSquare size={14} />
                  Order Now
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
