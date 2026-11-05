import React from 'react';
import { Package, TrendingUp, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function StockCard({
  available = 0,
  total = 0,
  sold = 0,
  unit = 'KG',
  minOrder = 1,
  className = '',
}) {
  const soldPercent = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;
  const isLowStock = available <= 15 && available > 0;
  const isOutOfStock = available <= 0;

  return (
    <div className={`bg-gradient-to-br from-white to-farm-50/50 rounded-2xl border border-farm-200/80 p-5 shadow-sm space-y-4 ${className}`}>
      {/* Title & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-farm-100 text-farm-700 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Farm Fresh Stock</h4>
            <span className="text-[11px] text-slate-500 font-medium">Real-time Verified Harvest</span>
          </div>
        </div>
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Selling Fast
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-farm-50 text-farm-700 border border-farm-200">
            <span className="w-2 h-2 rounded-full bg-farm-500" />
            Available Now
          </span>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available</span>
          <div className="text-lg sm:text-xl font-black text-farm-700 mt-0.5">
            {available.toLocaleString()} <span className="text-xs font-semibold text-farm-600">{unit}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Harvested</span>
          <div className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">
            {total.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{unit}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dispatched</span>
          <div className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">
            {sold.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{unit}</span>
          </div>
        </div>
      </div>

      {/* Stock Harvest Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
          <span>Batch Sold: {soldPercent}%</span>
          <span>Min Order: {minOrder} {unit}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-farm-500 to-farm-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${soldPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
