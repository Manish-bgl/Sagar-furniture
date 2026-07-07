// Quick-browse rounded circles for product types
// These are hardcoded item-type shortcuts that filter by name keyword

const PRODUCT_TYPES = [
  { key: 'bed',       label: 'Bed',       emoji: '🛏️', keywords: ['bed'] },
  { key: 'sofa',      label: 'Sofa',      emoji: '🛋️', keywords: ['sofa', 'couch', 'settee'] },
  { key: 'table',     label: 'Table',     emoji: '🍽️', keywords: ['table', 'dining table', 'coffee table', 'center table'] },
  { key: 'chair',     label: 'Chair',     emoji: '💺', keywords: ['chair', 'armchair', 'recliner'] },
  { key: 'wardrobe',  label: 'Wardrobe',  emoji: '🪟', keywords: ['wardrobe', 'cupboard', 'almirah', 'closet'] },
  { key: 'cabinet',   label: 'Cabinet',   emoji: '🗄️', keywords: ['cabinet', 'cabinet', 'tv unit', 'tv stand'] },
  { key: 'shelf',     label: 'Shelf',     emoji: '📚', keywords: ['shelf', 'shelves', 'bookshelf', 'rack', 'bookcase'] },
  { key: 'stool',     label: 'Stool',     emoji: '🪑', keywords: ['stool', 'bench', 'ottoman', 'pouf'] },
  { key: 'dresser',   label: 'Dresser',   emoji: '🪞', keywords: ['dresser', 'dressing table', 'vanity', 'makeup table'] },
  { key: 'swing',     label: 'Swing',     emoji: '🪂', keywords: ['swing', 'jhoola', 'hammock'] },
];

const ProductTypeFilter = ({ activeType, onTypeChange }) => {
  return (
    <div className="w-full">
      <p className="text-center text-xs font-semibold text-wood-400 uppercase tracking-widest mb-4">
        Browse by Item Type
      </p>
      <div className="flex flex-wrap gap-4 sm:gap-5 justify-center">
        {PRODUCT_TYPES.map((type) => {
          const isActive = activeType === type.key;
          return (
            <button
              key={type.key}
              onClick={() => onTypeChange(isActive ? '' : type.key)}
              aria-label={`Browse ${type.label}`}
              className="flex flex-col items-center gap-2 group transition-all duration-300 focus:outline-none"
            >
              {/* Rounded circle */}
              <div
                className={`
                  w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl
                  transition-all duration-300 border-2
                  ${isActive
                    ? 'border-wood-600 shadow-lg scale-110 ring-4 ring-wood-200'
                    : 'bg-white border-wood-200 group-hover:border-wood-400 group-hover:scale-105 group-hover:shadow-md'
                  }
                `}
                style={isActive ? { background: 'linear-gradient(135deg, #92400e 0%, #b45309 60%, #d97706 100%)' } : {}}
              >
                {type.emoji}
              </div>
              {/* Label */}
              <span
                className={`text-xs font-semibold transition-colors duration-200
                  ${isActive ? 'text-wood-700' : 'text-wood-500 group-hover:text-wood-700'}
                `}
              >
                {type.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Helper — call this from CatalogPage to filter products by type keyword
export const filterByProductType = (products, typeKey) => {
  if (!typeKey) return products;
  const type = PRODUCT_TYPES.find(t => t.key === typeKey);
  if (!type) return products;
  return products.filter(p =>
    type.keywords.some(kw => p.name?.toLowerCase().includes(kw))
  );
};

export default ProductTypeFilter;
