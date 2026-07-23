// Quick-browse floating circles — warm cream background, no container box

const ProductTypeFilter = ({ productTypes, activeType, onTypeChange }) => {
  if (!productTypes || productTypes.length === 0) return null;

  return (
    <section aria-label="Browse by item type" className="w-full py-2">
      {/* Section label */}
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] mb-5 text-walnut/50">
        Browse by Item Type
      </p>

      {/* Floating circles grid */}
      <div className="flex flex-wrap gap-5 sm:gap-6 justify-center">
        {productTypes.map((type) => {
          const isActive = activeType === type.key;
          return (
            <button
              key={type.id || type.key}
              onClick={() => onTypeChange(isActive ? '' : type.key)}
              aria-label={`Browse ${type.label}`}
              aria-pressed={isActive}
              className="flex flex-col items-center gap-2.5 group focus:outline-none"
            >
              {/* Circle */}
              <div
                className={`
                  relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center
                  text-2xl sm:text-[28px] transition-all duration-300 ease-out
                  ${isActive
                    ? 'scale-110 shadow-[0_6px_24px_rgba(181,88,58,0.35)]'
                    : 'shadow-[0_2px_10px_rgba(58,42,32,0.08)] group-hover:scale-105 group-hover:shadow-[0_4px_18px_rgba(181,88,58,0.20)]'
                  }
                `}
                style={
                  isActive
                    ? { background: 'linear-gradient(145deg, #B5583A 0%, #963D25 60%, #7A2E1B 100%)' }
                    : {}
                }
              >
                {/* Background for inactive — warm cream */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-full bg-[#FDF5EB]
                    border border-wood-200 transition-colors duration-300
                    group-hover:border-terracotta/40" />
                )}
                {/* Active pulse ring */}
                {isActive && (
                  <span className="absolute inset-[-4px] rounded-full border-2 border-terracotta/40
                    animate-ping opacity-60 pointer-events-none" />
                )}
                <span className="relative z-10">{type.emoji || '📦'}</span>
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-semibold tracking-wide transition-colors duration-200
                  ${isActive
                    ? 'text-walnut'
                    : 'text-walnut/50 group-hover:text-walnut/80'
                  }
                `}
              >
                {type.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ProductTypeFilter;
