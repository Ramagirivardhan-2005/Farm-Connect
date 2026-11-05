import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search fresh vegetables, fruits, farmers, channels...',
  className = '',
  autoFocus = false,
}) {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onChange) onChange('');
    if (onSearch) onSearch('');
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onChange) onChange(val);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex-1 max-w-2xl ${className}`}>
      <div className="relative flex items-center w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-farm-600" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-2.5 sm:py-3 text-sm rounded-2xl border border-slate-200 bg-white/90 shadow-sm placeholder:text-slate-400 focus:bg-white focus:border-farm-600 focus:ring-4 focus:ring-farm-600/10 transition duration-150 outline-none"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-farm-600 hover:bg-farm-700 text-white text-xs font-semibold shadow-sm transition"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
