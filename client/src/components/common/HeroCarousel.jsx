import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export const DEFAULT_HERO_SLIDES = [
  {
    id: 'hero-1',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
    tag: 'Direct Farmer Connection',
    heading: 'FROM OUR FARMS\nTO YOUR HOME',
    description: 'Fresh, 100% organic farm harvests directly from verified rural farmers to your doorstep with zero middlemen.',
    cta: 'Explore Verified Channels',
    stats: [
      { label: 'Verified Farms', val: '2,400+' },
      { label: 'Fresh Harvests', val: '18,000+ kg' },
      { label: 'Customer Trust', val: '4.9★' }
    ]
  },
  {
    id: 'hero-2',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1600&q=80',
    tag: 'Transparent & Traceable',
    heading: 'SUBSCRIBE TO\nFARMER CHANNELS',
    description: 'Track real-time harvest stories, get harvest updates, and support local farming families directly.',
    cta: 'Browse Top Farmers',
    stats: [
      { label: 'Active Channels', val: '850+' },
      { label: 'Direct Revenue', val: '98% to Farmers' },
      { label: 'Fast Delivery', val: '< 24 Hours' }
    ]
  },
  {
    id: 'hero-3',
    image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1600&q=80',
    tag: 'Pure & Certified Quality',
    heading: 'COLD-CHAIN\nFAST DELIVERY',
    description: 'Harvested at dawn, packed with biodegradable materials, and delivered fresh to your kitchen.',
    cta: 'Order Today',
    stats: [
      { label: 'Zero Pesticides', val: 'Natural / ZBNF' },
      { label: 'Delivery Tracking', val: 'Real-time GPS' },
      { label: 'Happy Families', val: '45,000+' }
    ]
  }
];

export default function HeroCarousel({ slides = DEFAULT_HERO_SLIDES, autoPlayInterval = 6000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [activeSlides.length, autoPlayInterval]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <div className="relative w-full h-full min-h-[550px] lg:min-h-screen overflow-hidden bg-slate-900 select-none flex flex-col justify-between p-8 sm:p-12 lg:p-16">
      {/* Background Images with Crossfade */}
      {activeSlides.map((slide, idx) => (
        <div
          key={slide.id || idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.heading}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
          />
          {/* Dual gradient overlay for readability and lush green tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/40" />
          <div className="absolute inset-0 bg-farm-950/30 mix-blend-multiply" />
        </div>
      ))}

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-farm-300" />
          <span>{currentSlide.tag || 'FarmConnect Verified Marketplace'}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-farm-200 bg-farm-950/50 backdrop-blur px-3 py-1 rounded-full border border-farm-800">
          <ShieldCheck className="w-4 h-4 text-farm-400" />
          <span>Government & FSSAI Verified</span>
        </div>
      </div>

      {/* Center / Bottom Content */}
      <div className="relative z-10 my-auto max-w-xl text-white pt-12 pb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] whitespace-pre-line text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-200">
          {currentSlide.heading}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-lg">
          {currentSlide.description}
        </p>

        {/* Highlight Stats */}
        {currentSlide.stats && (
          <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-white/15">
            {currentSlide.stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {stat.val}
                </span>
                <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Controls / Dots (Hidden if single slide) */}
      {activeSlides.length > 1 && (
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
          {/* Slide indicator dots */}
          <div className="flex items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-farm-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur text-white transition focus:outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeSlides.length)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur text-white transition focus:outline-none"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
