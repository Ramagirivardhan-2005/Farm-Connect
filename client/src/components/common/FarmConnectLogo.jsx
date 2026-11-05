import React from 'react';
import { Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FarmConnectLogo({ size = 'default', showTagline = false, light = false, linkTo = '/' }) {
  const sizeClasses = {
    small: {
      container: 'gap-1.5',
      iconBox: 'w-8 h-8 rounded-lg',
      icon: 'w-4 h-4',
      text: 'text-lg',
      tagline: 'text-[10px]'
    },
    default: {
      container: 'gap-2.5',
      iconBox: 'w-10 h-10 rounded-xl',
      icon: 'w-5 h-5',
      text: 'text-2xl',
      tagline: 'text-xs'
    },
    large: {
      container: 'gap-3',
      iconBox: 'w-14 h-14 rounded-2xl',
      icon: 'w-7 h-7',
      text: 'text-3xl',
      tagline: 'text-sm'
    }
  }[size] || sizeClasses.default;

  const content = (
    <div className={`inline-flex items-center ${sizeClasses.container} group select-none`}>
      <div className={`${sizeClasses.iconBox} flex items-center justify-center bg-gradient-to-tr from-farm-700 via-farm-600 to-farm-500 shadow-md shadow-farm-600/20 text-white transition-transform group-hover:scale-105 duration-200`}>
        <Sprout className={`${sizeClasses.icon} text-farm-100`} />
      </div>
      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight leading-none ${sizeClasses.text} ${light ? 'text-white' : 'text-slate-900'}`}>
          Farm<span className="text-farm-600 font-black">Connect</span>
        </div>
        {showTagline && (
          <span className={`font-medium tracking-wide uppercase mt-0.5 ${sizeClasses.tagline} ${light ? 'text-farm-200' : 'text-slate-500'}`}>
            Direct From Farms
          </span>
        )}
      </div>
    </div>
  );

  if (!linkTo) return content;
  return (
    <Link to={linkTo} className="inline-block focus:outline-none focus:ring-2 focus:ring-farm-500 rounded-xl">
      {content}
    </Link>
  );
}
