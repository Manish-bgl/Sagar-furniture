import { useEffect, useState } from 'react';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';
const WA_NUMBER = '918476815120';

// ─── Inline SVG Icons ───────────────────────────────────────
const DimensionIcon = () => (
  <svg className="w-4 h-4 text-[#F7DFC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);
const FinishIcon = () => (
  <svg className="w-4 h-4 text-[#F7DFC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);
const MaterialIcon = () => (
  <svg className="w-4 h-4 text-[#F7DFC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 0l4 4m10-4l-4 4M5 21l4-4m10 4l-4-4" />
  </svg>
);
const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#C9A15C]" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ProductModal = ({ product, products = [], categories = [], onClose, onProductSelect }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const images = (() => {
    if (product?.imageUrls && product.imageUrls.length > 0) return product.imageUrls;
    if (product?.imageUrl) return [product.imageUrl];
    return [PLACEHOLDER_IMAGE];
  })();

  const activeImage = images[activeImageIdx] || PLACEHOLDER_IMAGE;
  const deepLink = `${window.location.origin}?product=${product?.id}`;

  const whatsappText = [
    `Hello Sagar Furniture! 🙏`,
    `I am interested in:`,
    `*${product?.name}*`,
    product?.price ? `💰 Price: ₹${product.price}` : '',
    product?.material ? `🪵 Material: ${product.material}` : '',
    product?.dimensions ? `📐 Size: ${product.dimensions}` : '',
    ``,
    `🌐 Product Link: ${deepLink}`,
    `🖼️ Image: ${images[0] || ''}`,
    ``,
    `Please share availability & custom options.`,
  ].filter(l => l !== undefined).join('\n');

  const whatsappUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

  useEffect(() => {
    setActiveImageIdx(0);
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      }
      if (e.key === 'ArrowRight') setActiveImageIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setActiveImageIdx(i => (i - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, images.length, lightboxOpen]);

  if (!product) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sagar Furniture - ${product.name}`,
          text: `Check out this handcrafted ${product.name} from Sagar Furniture!`,
          url: deepLink,
        });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(deepLink);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch (_) {}
    }
  };

  const getCatLabel = (slug) => {
    const cat = categories.find(c => c.slug === slug);
    return cat ? cat.name.toUpperCase() : (slug || '').toUpperCase();
  };

  const similarProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const infoCards = [
    product.dimensions && { icon: <DimensionIcon />, label: 'Dimensions', value: product.dimensions },
    product.finish && { icon: <FinishIcon />, label: 'Polish / Finish', value: product.finish },
    product.material && { icon: <MaterialIcon />, label: 'Material', value: product.material },
  ].filter(Boolean);

  return (
    <>
      {/* ═══════════ Main Modal ═══════════ */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 modal-overlay animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-xl max-h-[92vh] overflow-y-auto animate-scale-in rounded-3xl shadow-2xl relative"
          onClick={e => e.stopPropagation()}
          style={{ backgroundColor: '#F7DFC4', scrollbarWidth: 'thin' }}
        >
          {/* ─── Hero Image Section ─── */}
          <div className="relative w-full h-[320px] sm:h-[450px] md:h-[520px] overflow-hidden bg-[#3A2A20]/10">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-[center_60%] transition-opacity duration-300 protect-img"
              onClick={() => setLightboxOpen(true)}
              onError={e => { e.target.src = PLACEHOLDER_IMAGE; }}
            />
            {/* 🛡️ Protection overlay */}
            <div className="absolute inset-0 z-10 select-none cursor-pointer" onClick={() => setLightboxOpen(true)} />

            {/* Dark gradient fade at the bottom of the image */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#3A2A20]/80 via-[#3A2A20]/30 to-transparent pointer-events-none z-20" />

            {/* Back button (top-left, circular, semi-transparent background) */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 bg-[#3A2A20]/50 backdrop-blur-sm rounded-full
                flex items-center justify-center text-white hover:bg-[#3A2A20]/75 hover:scale-105 transition-all z-30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Gallery counter (top-right, e.g. "1/4") */}
            {images.length > 1 && (
              <div className="absolute top-4 right-4 bg-[#3A2A20]/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full z-30">
                {activeImageIdx + 1}/{images.length}
              </div>
            )}

            {/* Thumbnail strip (bottom-left, 4 small squares, on top of image) */}
            {images.length > 1 && (
              <div className="absolute bottom-20 left-4 flex gap-2 z-30">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setActiveImageIdx(idx); }}
                    className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 relative
                      ${activeImageIdx === idx
                        ? 'border-white scale-105 shadow-lg'
                        : 'border-white/40 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-cover protect-img"
                      onError={e => { e.target.src = PLACEHOLDER_IMAGE; }} />
                    <div className="absolute inset-0 select-none z-10" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Overlapping Content Card ─── */}
          <div 
            className="relative -mt-[60px] z-30 rounded-t-[24px] shadow-[0_-8px_30px_rgba(58,42,32,0.15)] px-5 py-6 sm:p-6 md:p-8"
            style={{ backgroundColor: '#F7DFC4' }}
          >
            {/* 1. Category Tag */}
            <span 
              className="inline-block text-[#C9A15C] text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-lg mb-3"
              style={{ backgroundColor: '#3A2A20' }}
            >
              {getCatLabel(product.category)}
            </span>

            {/* 2. Title + Price Row */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold leading-tight flex-1" style={{ color: '#3A2A20' }}>
                {product.name}
              </h2>
              {product.price && (
                <div 
                  className="flex-shrink-0 rounded-2xl px-4 py-2 text-center min-w-[90px] border"
                  style={{ backgroundColor: '#B5583A', borderColor: '#B5583A' }}
                >
                  <p className="text-white/70 text-[8px] font-semibold uppercase tracking-wider">Price</p>
                  <p className="text-white font-bold text-base sm:text-lg leading-tight">₹{product.price}</p>
                </div>
              )}
            </div>

            {/* 3. Rating / Trust Row */}
            <div className="flex items-center gap-1.5 mb-5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
              </div>
              <span className="text-[#3A2A20]/60 text-xs font-semibold ml-1">
                Bestseller · 40+ families chose this
              </span>
            </div>

            {/* 4. Info Cards Row (24px gap between cards) */}
            {infoCards.length > 0 && (
              <div className="flex gap-6 mb-6 overflow-x-auto pb-1">
                {infoCards.map((card, i) => (
                  <div 
                    key={i} 
                    className="flex-1 min-w-[100px] rounded-2xl p-3 flex flex-col items-center text-center shadow-sm"
                    style={{ backgroundColor: '#3A2A20' }}
                  >
                    <div className="mb-1.5">{card.icon}</div>
                    <p className="text-[#F7DFC4]/50 text-[8px] font-semibold uppercase tracking-wider mb-0.5">{card.label}</p>
                    <p className="text-[#F7DFC4] font-semibold text-xs leading-tight">{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Warranty block */}
            {product.warranty && (
              <div className="flex items-center gap-2 mb-5 rounded-xl px-4 py-2.5 bg-[#3A2A20]/5 border border-[#3A2A20]/10">
                <span className="text-base">🛡️</span>
                <p className="text-[#3A2A20] text-xs font-bold">{product.warranty}</p>
              </div>
            )}

            {/* 5. Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="font-playfair text-base font-bold mb-2" style={{ color: '#3A2A20' }}>Description</h3>
                <p className="leading-relaxed text-sm" style={{ color: '#3A2A20' }}>{product.description}</p>
              </div>
            )}

            {/* 6. Custom Order Banner */}
            <div 
              className="border-2 border-dashed rounded-2xl p-4 mb-6 flex items-start gap-3"
              style={{ borderColor: 'rgba(181, 88, 58, 0.4)', backgroundColor: 'rgba(181, 88, 58, 0.05)' }}
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <div>
                <p className="font-semibold text-sm mb-0.5" style={{ color: '#3A2A20' }}>Custom Orders Available</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(58, 42, 32, 0.7)' }}>
                  Get it made in your size, wood type, and polish finish. Contact us on WhatsApp for pricing and details.
                </p>
              </div>
            </div>

            {/* 7. CTA Buttons */}
            <div className="flex gap-3 mb-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2.5 text-white font-bold py-3.5
                  rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)' }}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Inquire on WhatsApp
              </a>
              <button
                onClick={handleShare}
                className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl
                  transition-all hover:scale-105 active:scale-95 text-lg"
                style={{ backgroundColor: '#3A2A20', color: '#F7DFC4' }}
              >
                {shareSuccess ? (
                  <span className="text-base">✅</span>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.636-2.582m0 5.678l-4.636-2.582m0 0a4 4 0 110-5.83M18 8a3 3 0 110-6 3 3 0 010 6zm0 14a3 3 0 110-6 3 3 0 010 6z" />
                  </svg>
                )}
              </button>
            </div>

            {/* ❤️ Related Products (Similar Products) */}
            {similarProducts.length > 0 && (
              <div className="border-t border-[#3A2A20]/10 pt-5">
                <p className="font-playfair text-base font-bold mb-3" style={{ color: '#3A2A20' }}>You May Also Like</p>
                <div className="grid grid-cols-3 gap-3">
                  {similarProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => onProductSelect && onProductSelect(p)}
                      className="bg-[#3A2A20]/5 border border-[#3A2A20]/10 rounded-2xl overflow-hidden cursor-pointer
                        hover:border-[#B5583A]/60 hover:-translate-y-0.5 transition-all duration-200 group relative"
                    >
                      <div className="relative h-20 w-full overflow-hidden">
                        <img
                          src={p.imageUrls?.[0] || p.imageUrl || PLACEHOLDER_IMAGE}
                          alt={p.name}
                          className="w-full h-full object-cover protect-img"
                          onError={e => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                        <div className="absolute inset-0 z-10 select-none" />
                      </div>
                      <div className="p-2">
                        <p className="font-semibold text-xs truncate" style={{ color: '#3A2A20' }}>{p.name}</p>
                        {p.price && <p className="text-[#B5583A] text-[10px] font-bold mt-0.5">₹ {p.price}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ─── Lightbox (Fullscreen Image Viewer) ─── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-charcoal-950/95 flex items-center justify-center animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-full max-h-full p-4 flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img
              src={activeImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-xl select-none protect-img"
              onError={e => { e.target.src = PLACEHOLDER_IMAGE; }}
            />
            <div className="absolute inset-0 select-none z-10" />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setActiveImageIdx(i => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl transition-all"
              >←</button>
              <button
                onClick={e => { e.stopPropagation(); setActiveImageIdx(i => (i + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl transition-all"
              >→</button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <button key={idx} onClick={e => { e.stopPropagation(); setActiveImageIdx(idx); }}
                  className={`h-2 rounded-full transition-all ${activeImageIdx === idx ? 'w-6 bg-terracotta' : 'w-2 bg-white/40'}`}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
          >✕</button>
        </div>
      )}
    </>
  );
};

export default ProductModal;
