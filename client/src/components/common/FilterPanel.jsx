import React from 'react';
import { SlidersHorizontal, RotateCcw, MapPin, Navigation, Tag, Star, DollarSign } from 'lucide-react';
import Button from './Button';

export const CATEGORIES = [
  'All Categories',
  'Vegetables',
  'Fruits',
  'Leafy Greens',
  'Root Vegetables',
  'Gourds',
  'Nightshades',
  'Exotics & Herbs',
];

export const DISTANCES = [
  { label: 'Any Distance', value: '' },
  { label: 'Within 5 km', value: '5' },
  { label: 'Within 10 km', value: '10' },
  { label: 'Within 25 km', value: '25' },
  { label: 'Within 50 km', value: '50' },
  { label: 'Within 100 km', value: '100' },
];

export const RATINGS = [
  { label: 'All Ratings', value: '' },
  { label: '4.0★ and above', value: '4' },
  { label: '3.0★ and above', value: '3' },
  { label: '2.0★ and above', value: '2' },
];

export default function FilterPanel({
  filters,
  onChange,
  onReset,
  className = '',
  compact = false,
}) {
  const handleChange = (field, val) => {
    onChange({ ...filters, [field]: val });
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-farm-600" />
          <span>Filters & Discovery</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-farm-700 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5 text-farm-600" />
          <span>Product Category</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = (!filters.category && cat === 'All Categories') || filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleChange('category', cat === 'All Categories' ? '' : cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                  isSelected
                    ? 'bg-farm-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Distance Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Navigation className="w-3.5 h-3.5 text-farm-600" />
          <span>Distance from Farm</span>
        </label>
        <select
          value={filters.distance || ''}
          onChange={(e) => handleChange('distance', e.target.value)}
          className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
        >
          {DISTANCES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Location / District */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-farm-600" />
          <span>Location / District</span>
        </label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="e.g. Pune, Nashik, Bengaluru"
          className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
        />
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Minimum Farmer Rating</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RATINGS.map((r) => {
            const isSelected = filters.rating === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => handleChange('rating', r.value)}
                className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium text-left transition ${
                  isSelected
                    ? 'border-farm-600 bg-farm-50 text-farm-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5 text-farm-600" />
          <span>Price Per KG (₹)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            placeholder="Min ₹"
            className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            placeholder="Max ₹"
            className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
          />
        </div>
      </div>
    </div>
  );
}
