// Quick-browse rounded circles for product types loaded dynamically from Firestore

const ProductTypeFilter = ({ productTypes, activeType, onTypeChange }) => {
  if (!productTypes || productTypes.length === 0) return null;

  return (
    <div className="w-full">
      <p className="text-center text-xs font-semibold text-wood-400 uppercase tracking-widest mb-4">
        Browse by Item Type
      </p>
      <div className="flex flex-wrap gap-4 sm:gap-5 justify-center">
        {productTypes.map((type) => {
          const isActive = activeType === type.key;
          return (
            <button
              key={type.id || type.key}
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
                {type.emoji || '📦'}
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

export default ProductTypeFilter;
