const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏠' },
  { id: 'living', label: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { id: 'dining', label: 'Dining Room', icon: '🍽️' },
  { id: 'office', label: 'Office', icon: '💼' },
];

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center py-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300
            ${activeCategory === cat.id
              ? 'category-pill-active scale-105 shadow-wood'
              : 'bg-white text-wood-700 border border-wood-200 hover:border-wood-400 hover:text-wood-800 hover:scale-105 shadow-card'
            }`}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
