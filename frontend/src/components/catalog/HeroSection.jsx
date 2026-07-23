import { useState, useEffect } from 'react';

const HeroSection = ({ banners = [] }) => {
  const activeBanners = banners.filter(b => b.active);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide carousel if multiple banners exist
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  // If no banners are added by manager, show fallback premium default banner
  if (activeBanners.length === 0) {
    return (
      <div className="relative bg-hero-gradient text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-wood-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-wood-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
          {/* Left Text */}
          <div className="flex-1 text-center md:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-wood-600/30 border border-wood-400/30 px-4 py-2 rounded-full text-wood-200 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-wood-400 rounded-full animate-pulse" />
              Premium Handcrafted Furniture
            </div>

            <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-tight mb-4">
              Sagar
              <span className="block bg-gradient-to-r from-wood-300 to-wood-500 bg-clip-text text-transparent">
                Furniture
              </span>
            </h1>

            <p className="text-wood-100/80 text-lg md:text-xl max-w-lg mb-2 leading-relaxed">
              हस्तनिर्मित फर्नीचर जो आपके घर को सुंदर और यादगार बनाए।
            </p>
            <p className="text-wood-300 font-medium mb-8">
              Custom designs available on request.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a href="#catalog" className="btn-primary">
                View Catalog →
              </a>
              <a
                href="https://wa.me/918476815120?text=Hello%20Sagar%20Furniture,%20I%20would%20like%20to%20know%20more%20about%20your%20furniture."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-green-400/60 text-green-300 px-6 py-3 rounded-xl hover:bg-green-500/20 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right Stats */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-4 animate-fade-in">
            {[
              { label: 'Designs', value: '50+' },
              { label: 'Happy Clients', value: '200+' },
              { label: 'Years Experience', value: '15+' },
              { label: 'Custom Orders', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center">
                <div className="font-playfair text-3xl font-bold text-wood-300">{stat.value}</div>
                <div className="text-wood-100/70 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Slider Banner Setup
  const currentBanner = activeBanners[currentSlide];
  return (
    <div className="relative h-[320px] md:h-[480px] bg-charcoal-950 text-white overflow-hidden transition-all duration-700">
      {/* Background Image Slide */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
      />
      {/* Premium Glass Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-900/70 to-transparent" />

      {/* Slide Content */}
      <div className="relative max-w-6xl mx-auto h-full px-6 flex flex-col justify-center animate-fade-in">
        <span className="inline-block bg-wood-600/30 border border-wood-400/30 px-3 py-1 rounded-full text-wood-200 text-xs font-semibold uppercase tracking-wider mb-4 w-fit">
          🎯 Announcement
        </span>
        <h2 className="font-playfair text-3xl md:text-5xl font-bold leading-tight mb-2 text-white max-w-xl">
          {currentBanner.title}
        </h2>
        {currentBanner.subtitle && (
          <p className="text-wood-100/90 text-sm md:text-lg max-w-lg mb-6 leading-relaxed">
            {currentBanner.subtitle}
          </p>
        )}
        
        <div className="flex gap-3">
          {currentBanner.linkUrl ? (
            <a 
              href={currentBanner.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary text-sm px-6 py-2.5"
            >
              Learn More →
            </a>
          ) : (
            <a href="#catalog" className="btn-primary text-sm px-6 py-2.5">
              View Catalog →
            </a>
          )}
        </div>
      </div>

      {/* Slide Navigation Dots */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 
                ${currentSlide === idx ? 'bg-wood-400 w-6' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSection;
