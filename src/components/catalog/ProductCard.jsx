const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80';

// ─── Decent inline SVG icons ───────────────────────────────────────────────
const MaterialIcon = () => (
  <svg className="w-3.5 h-3.5 inline mr-1 text-wood-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 0l4 4m10-4l-4 4M5 21l4-4m10 4l-4-4M9 7h6m-6 4h6m-6 4h4" />
  </svg>
);

const DimensionIcon = () => (
  <svg className="w-3.5 h-3.5 inline mr-1 text-wood-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const ProductCard = ({ product, categories = [], onClick }) => {
  const whatsappMsg = encodeURIComponent(
    `Hello Sagar Furniture! 🙏\n\nI am interested in:\n*${product.name}*\n\nCould you please share more details, price & availability?`
  );
  const whatsappUrl = `https://wa.me/918476815120?text=${whatsappMsg}`;

  const currentCategory = categories.find(c => c.slug === product.category);
  const categoryLabel = currentCategory
    ? currentCategory.name
    : product.category;

  // Use first image from imageUrls array, fall back to imageUrl string
  const displayImage = product.imageUrls?.[0] || product.imageUrl || PLACEHOLDER_IMAGE;
  const hasMultipleImages = (product.imageUrls?.length || 0) > 1;

  return (
    <div
      className="card group cursor-pointer animate-fade-in relative"
      onClick={() => onClick(product)}
    >
      {/* ⭐ Featured Badge */}
      {product.featured && (
        <span className="absolute top-3 right-3 z-10 bg-yellow-400 text-charcoal-900 font-bold text-xs px-2.5 py-1 rounded-lg shadow-md">
          ★ Featured
        </span>
      )}

      {/* Product Image — NO hover zoom, clean static view */}
      <div className="relative overflow-hidden h-56 bg-wood-100">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-opacity duration-300 protect-img"
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
        />
        {/* 🛡️ Transparent protection overlay (blocks context menu / saving) */}
        <div className="absolute inset-0 z-10 select-none" />

        {/* Category label pill */}
        <span className="absolute top-3 left-3 bg-charcoal-900/75 text-white backdrop-blur-sm text-[10px] font-semibold px-2.5 py-1 rounded-lg">
          {categoryLabel}
        </span>

        {/* Multiple images indicator */}
        {hasMultipleImages && (
          <span className="absolute bottom-3 right-3 bg-charcoal-900/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {product.imageUrls.length} photos
          </span>
        )}

        {/* View details overlay */}
        <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/25 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 bg-white text-wood-800 font-semibold px-4 py-2 rounded-xl transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 text-sm shadow-md">
            View Details
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 bg-white transition-colors duration-300">
        <h3 className="font-playfair font-bold text-lg text-charcoal-900 mb-2 line-clamp-1">
          {product.name}
        </h3>

        <div className="space-y-1 mb-3">
          {product.material && (
            <p className="text-wood-600 text-xs flex items-center">
              <MaterialIcon />
              {product.material}
            </p>
          )}
          {product.dimensions && (
            <p className="text-wood-500 text-xs flex items-center">
              <DimensionIcon />
              {product.dimensions}
            </p>
          )}
        </div>

        {product.price && (
          <p className="font-bold text-wood-700 text-base mb-3">₹ {product.price}</p>
        )}

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="whatsapp-btn w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-300 hover:scale-105"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Inquire on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
