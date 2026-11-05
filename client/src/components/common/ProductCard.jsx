import React, { useState } from 'react';
import { Heart, ShoppingBag, Check, MapPin, Eye, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import Button from './Button';

export default function ProductCard({
  product,
  onAddToCart,
  onToggleLike,
  isLiked = false,
  showFarmer = true,
  className = '',
}) {
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleLike) onToggleLike(product.id || product._id);
  };

  const isOutOfStock = product.availableStock <= 0;

  return (
    <div className={`group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-farm-400/80 transition-all duration-300 overflow-hidden ${className}`}>
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.farmingType && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-farm-900/85 backdrop-blur-md text-farm-300 border border-farm-700/60 shadow-sm">
              <Sparkles className="w-3 h-3 text-farm-400" />
              {product.farmingType}
            </span>
          )}
          {product.qualityGrade && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 shadow-xs">
              Grade {product.qualityGrade}
            </span>
          )}
        </div>

        {/* Wishlist / Like button */}
        <button
          type="button"
          onClick={handleLike}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-sm ${
            isLiked
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-500'
          }`}
          aria-label="Save product"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Quick View Overlay on Hover */}
        <Link
          to={`/item/${product.id || product._id}`}
          className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 text-xs font-bold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-farm-600" />
            View Farm Fresh Details
          </span>
        </Link>
      </div>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Channel / Farmer info */}
          {showFarmer && product.channel && (
            <Link
              to={`/channel/${product.channel.channelId || product.channel.id}`}
              className="text-[11px] font-semibold text-farm-700 hover:text-farm-800 hover:underline flex items-center gap-1 mb-1 truncate"
            >
              <span>{product.channel.name || 'Organic Farm Channel'}</span>
              {product.channel.location && (
                <span className="text-slate-400 font-normal">
                  • {product.channel.location}
                </span>
              )}
            </Link>
          )}

          {/* Product Title */}
          <Link to={`/item/${product.id || product._id}`}>
            <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-farm-600 transition truncate">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-1.5 flex items-center justify-between">
            <Rating value={product.rating || 4.8} count={product.reviewsCount || 128} size="xs" />
            <span className="text-[11px] text-slate-500 font-medium">
              {product.purchaseCount || product.soldStock || 320}+ sold
            </span>
          </div>
        </div>

        {/* Price & Stock info */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">
                ₹{product.price}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / {product.unit || 'KG'}
              </span>
            </div>

            {/* Available stock status */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-farm-500'}`} />
              <span className={`text-xs font-bold ${isOutOfStock ? 'text-rose-600' : 'text-farm-700'}`}>
                {isOutOfStock ? 'Sold out' : `${product.availableStock || 120} ${product.unit || 'KG'} left`}
              </span>
            </div>
          </div>

          {/* Add to Cart button */}
          <Button
            variant={added ? 'success' : isOutOfStock ? 'secondary' : 'primary'}
            size="md"
            fullWidth
            disabled={isOutOfStock}
            icon={added ? Check : ShoppingBag}
            onClick={handleAdd}
          >
            {added ? 'Added to Cart' : isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
