const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative max-w-md mx-auto">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-wood-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search furniture... (e.g. Sofa, Bed, Teak)"
        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-wood-200 rounded-2xl
                   text-wood-900 placeholder-wood-400 font-outfit
                   focus:outline-none focus:border-wood-500 focus:ring-4 focus:ring-wood-200/50
                   transition-all duration-300 shadow-card"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-4 flex items-center text-wood-400 hover:text-wood-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
