import React from 'react';
import { Star } from 'lucide-react';

export default function Rating({ value = 0, count, size = 'sm', interactive = false, onChange }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size] || 'w-3.5 h-3.5';

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const filled = star <= Math.round(value);
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                className={`${sizeClasses} ${
                  filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
                }`}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs font-bold text-slate-800">
        {Number(value).toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-xs text-slate-400 font-normal">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
