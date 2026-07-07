import { useEffect, useState } from 'react';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';

const WA_NUMBER = '918476815120';

const ProductModal = ({ product, products = [], categories = [], onClose, onProductSelect }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Build image array from product data
  const images = (() => {
    if (product?.imageUrls && product.imageUrls.length > 0) return product.imageUrls;
    if (product?.imageUrl) return [product.imageUrl];
    return [PLACEHOLDER_IMAGE];
  })();

  const activeImage = images[activeImageIdx] || PLACEHOLDER_IMAGE;

  // Deep link
  const deepLink = `${window.location.origin}?product=${product?.id}`;

  // WhatsApp pre-fill with product info + image + link
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
    return cat ? `${cat.emoji} ${cat.name}` : slug;
  };

  const similarProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 modal-overlay animate-fade-in" onClick={onClose}>
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[93vh] overflow-y-auto animate-scale-in"
          onClick={e => e.stopPropagation()}
        >
          {/* ─── Image Gallery ─── */}
          <div className="relative bg-charcoal-950 rounded-t-3xl overflow-hidden">
            <div
              className="relative h-72 md:h-80 cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300 protect-img"
                onError={e => { e.target.src = PLACEHOLDER_IMAGE; }}
              />
              {/* 🛡️ Transparent protection overlay */}
              <div className="absolute inset-0 z-10 select-none" />
              {/* Zoom hint */}
              <div className="absolute bottom-3 left-3 bg-charcoal-900/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-lg pointer-events-none select-none z-20">
                🔍 Click photo to enlarge
              </div>
            </div>

            {/* Thumbnail strip (only if > 1 image) */}
            {images.length > 1 && (
              <div className="flex gap-2 px-4 pb-3 pt-2 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 relative
                      ${activeImageIdx === idx ? 'border-wood-400 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover protect-img"
                      onError={e => { e.target.src = PLACEHOLDER_IMAGE; }} />
                    {/* 🛡️ Transparent protection overlay */}
                    <div className="absolute inset-0 select-none z-10" />
                  </button>
                ))}
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all z-10"
            >
              <svg className="w-4 h-4 text-charcoal-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ─── Content ─── */}
          <div className="p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
              <h2 className="font-playfair text-2xl font-bold text-charcoal-900 leading-tight">
                {product.name}
              </h2>
              {product.price && (
                <p className="text-xl font-bold text-wood-700 whitespace-nowrap">₹ {product.price}</p>
              )}
            </div>

            <div className="mb-4">
              <span className="badge bg-wood-100 text-wood-700 text-xs">
                {getCatLabel(product.category)}
              </span>
              {product.featured && (
                <span className="badge bg-yellow-100 text-yellow-700 text-xs ml-2">★ Featured</span>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {product.material && (
                <div className="bg-wood-50 rounded-xl p-3">
                  <p className="text-wood-500 text-[10px] mb-0.5 font-medium uppercase">Material</p>
                  <p className="font-semibold text-wood-800 text-sm">{product.material}</p>
                </div>
              )}
              {product.dimensions && (
                <div className="bg-wood-50 rounded-xl p-3">
                  <p className="text-wood-500 text-[10px] mb-0.5 font-medium uppercase">Dimensions</p>
                  <p className="font-semibold text-wood-800 text-sm">{product.dimensions}</p>
                </div>
              )}
              {product.finish && (
                <div className="bg-wood-50 rounded-xl p-3">
                  <p className="text-wood-500 text-[10px] mb-0.5 font-medium uppercase">Polish / Finish</p>
                  <p className="font-semibold text-wood-800 text-sm">{product.finish}</p>
                </div>
              )}
              {product.warranty && (
                <div className="bg-wood-50 rounded-xl p-3">
                  <p className="text-wood-500 text-[10px] mb-0.5 font-medium uppercase">Warranty</p>
                  <p className="font-semibold text-wood-800 text-sm">{product.warranty}</p>
                </div>
              )}
            </div>

            {product.description && (
              <div className="mb-5">
                <p className="font-semibold text-charcoal-900 text-sm mb-1">Description</p>
                <p className="text-wood-700 leading-relaxed text-sm">{product.description}</p>
              </div>
            )}

            <div className="bg-wood-50 border border-wood-200 rounded-xl p-3 mb-5 text-xs text-wood-700">
              <span className="font-semibold">🎨 Custom Orders Available:</span> Get it made in your size, wood, and finish.
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6 pb-6 border-b border-wood-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn flex-[2] flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-all hover:scale-105 text-sm"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Inquire on WhatsApp
              </a>
              <button
                onClick={handleShare}
                className={`flex-1 flex items-center justify-center gap-1.5 font-semibold py-3 rounded-xl border-2 transition-all hover:scale-105 text-sm
                  ${shareSuccess
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : 'border-wood-200 bg-white text-wood-700 hover:bg-wood-50 hover:border-wood-400'
                  }`}
              >
                {shareSuccess ? '✅ Copied!' : '📤 Share'}
              </button>
            </div>

            {/* ❤️ Similar Products */}
            {similarProducts.length > 0 && (
              <div>
                <p className="font-playfair text-base font-bold text-charcoal-900 mb-3">❤️ Similar Products</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {similarProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => onProductSelect && onProductSelect(p)}
                      className="border border-wood-100 rounded-xl overflow-hidden cursor-pointer hover:border-wood-300 hover:-translate-y-0.5 transition-all duration-200 group relative"
                    >
                      <div className="relative h-20 w-full overflow-hidden">
                        <img
                          src={p.imageUrls?.[0] || p.imageUrl || PLACEHOLDER_IMAGE}
                          alt={p.name}
                          className="w-full h-full object-cover protect-img"
                          onError={e => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                        {/* 🛡️ Transparent protection overlay */}
                        <div className="absolute inset-0 z-10 select-none" />
                      </div>
                      <div className="p-2">
                        <p className="font-semibold text-charcoal-900 text-[11px] truncate">{p.name}</p>
                        {p.price && <p className="text-wood-600 text-[10px] mt-0.5">₹ {p.price}</p>}
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
            {/* 🛡️ Transparent protection overlay */}
            <div className="absolute inset-0 select-none z-10" />
          </div>

          {/* Lightbox nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setActiveImageIdx(i => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl transition-all"
              >
                ←
              </button>
              <button
                onClick={e => { e.stopPropagation(); setActiveImageIdx(i => (i + 1) % images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl transition-all"
              >
                →
              </button>
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <button key={idx} onClick={e => { e.stopPropagation(); setActiveImageIdx(idx); }}
                  className={`h-2 rounded-full transition-all ${activeImageIdx === idx ? 'w-6 bg-wood-400' : 'w-2 bg-white/40'}`}
                />
              ))}
            </div>
          )}

          {/* Close lightbox */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default ProductModal;
