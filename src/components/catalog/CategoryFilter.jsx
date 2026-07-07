// Original square-pill style — admin-managed categories
const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center py-2">
      {/* All Option */}
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
          ${activeCategory === 'all'
            ? 'category-pill-active scale-105 shadow-wood'
            : 'bg-white text-wood-700 border border-wood-200 hover:border-wood-400 hover:text-wood-800 hover:scale-105 shadow-card'
          }`}
      >
        <span>🏠</span>
        All
      </button>

      {/* Dynamic admin-managed Categories */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.slug)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
            ${activeCategory === cat.slug
              ? 'category-pill-active scale-105 shadow-wood'
              : 'bg-white text-wood-700 border border-wood-200 hover:border-wood-400 hover:text-wood-800 hover:scale-105 shadow-card'
            }`}
        >
          <span>{cat.emoji || '📦'}</span>
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
