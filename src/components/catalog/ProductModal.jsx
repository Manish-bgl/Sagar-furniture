import { useEffect } from 'react';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80';

const ProductModal = ({ product, onClose }) => {
  const whatsappMsg = encodeURIComponent(
    `Hello Sagar Furniture! I love your *${product?.name}*. Could you please share the price and availability?`
  );
  const whatsappUrl = `https://wa.me/918476815120?text=${whatsappMsg}`;

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-72 md:h-80">
          <img
            src={product.imageUrl || PLACEHOLDER_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover rounded-t-3xl"
            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
          >
            <svg className="w-5 h-5 text-charcoal-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-900 mb-2">
            {product.name}
          </h2>

          {product.price && (
            <p className="text-xl font-semibold text-wood-700 mb-4">₹ {product.price}</p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {product.material && (
              <div className="bg-wood-50 rounded-xl p-3">
                <p className="text-wood-500 text-xs mb-1">Material / Wood</p>
                <p className="font-semibold text-wood-800">{product.material}</p>
              </div>
            )}
            {product.dimensions && (
              <div className="bg-wood-50 rounded-xl p-3">
                <p className="text-wood-500 text-xs mb-1">Dimensions / Size</p>
                <p className="font-semibold text-wood-800">{product.dimensions}</p>
              </div>
            )}
            {product.finish && (
              <div className="bg-wood-50 rounded-xl p-3">
                <p className="text-wood-500 text-xs mb-1">Polish / Finish</p>
                <p className="font-semibold text-wood-800">{product.finish}</p>
              </div>
            )}
            {product.warranty && (
              <div className="bg-wood-50 rounded-xl p-3">
                <p className="text-wood-500 text-xs mb-1">Warranty</p>
                <p className="font-semibold text-wood-800">{product.warranty}</p>
              </div>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-charcoal-900 mb-2">Description</h3>
              <p className="text-wood-700 leading-relaxed text-sm">{product.description}</p>
            </div>
          )}

          {/* Custom Order Note */}
          <div className="bg-wood-50 border border-wood-200 rounded-xl p-4 mb-5">
            <p className="text-wood-700 text-sm">
              <span className="font-semibold">🎨 Custom Orders Available:</span> Get it made in your preferred size, polish, and color.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn flex-1 flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Inquire on WhatsApp
            </a>
            <button onClick={onClose} className="btn-secondary flex-1">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
