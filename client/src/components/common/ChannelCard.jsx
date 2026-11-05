import React, { useState } from 'react';
import { Pin, Users, MapPin, CheckCircle, ExternalLink, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import Button from './Button';

export default function ChannelCard({
  channel,
  onSubscribe,
  onPin,
  isSubscribed = false,
  isPinned = false,
  className = '',
}) {
  const [subscribed, setSubscribed] = useState(isSubscribed);
  const [pinned, setPinned] = useState(isPinned);

  if (!channel) return null;

  const handleSubscribeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !subscribed;
    setSubscribed(nextState);
    if (onSubscribe) onSubscribe(channel.id || channel.channelId, nextState);
  };

  const handlePinToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !pinned;
    setPinned(nextState);
    if (onPin) onPin(channel.id || channel.channelId, nextState);
  };

  return (
    <div className={`group relative flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-farm-300 transition-all duration-300 overflow-hidden ${className}`}>
      {/* Channel Banner Cover */}
      <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-100">
        <img
          src={channel.bannerImage || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80'}
          alt={channel.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges & Pin Button */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-farm-900/80 backdrop-blur-md text-farm-300 border border-farm-700/50 shadow-sm">
            <CheckCircle className="w-3 h-3 text-farm-400" />
            Verified Farmer
          </span>

          <button
            type="button"
            onClick={handlePinToggle}
            className={`p-2 rounded-full backdrop-blur-md transition shadow-sm ${
              pinned
                ? 'bg-amber-400 text-slate-950 font-bold hover:bg-amber-300'
                : 'bg-black/30 hover:bg-black/50 text-white'
            }`}
            title={pinned ? 'Unpin Channel' : 'Pin to Top of Dashboard'}
            aria-label="Pin channel"
          >
            <Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-slate-950' : ''}`} />
          </button>
        </div>

        {/* Channel ID Badge */}
        <div className="absolute bottom-2.5 right-3 text-[10px] font-mono font-medium text-white/90 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur">
          {channel.channelId || 'FC-CH-001'}
        </div>
      </div>

      {/* Profile Avatar & Header Info */}
      <div className="px-5 pt-0 pb-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Avatar overlapping banner */}
          <div className="-mt-9 mb-3 flex items-end justify-between">
            <div className="relative">
              <img
                src={channel.profileImage || channel.farmer?.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80'}
                alt={channel.farmerName}
                className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-farm-500 border-2 border-white flex items-center justify-center text-white" title="Active Farmer">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Rating value={channel.rating || 4.9} count={channel.reviewsCount || 340} size="xs" />
            </div>
          </div>

          {/* Titles & Farmer Name */}
          <Link to={`/channel/${channel.channelId || channel.id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-farm-600 transition truncate leading-snug">
              {channel.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <span>By {channel.farmerName || 'Farmer'}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-0.5 text-slate-600 truncate">
              <MapPin className="w-3 h-3 text-farm-600 shrink-0" />
              {channel.location || 'Maharashtra, India'}
            </span>
          </p>

          {/* Bio snippet */}
          {channel.bio && (
            <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {channel.bio}
            </p>
          )}

          {/* Featured items preview pills */}
          {channel.featuredProducts && channel.featuredProducts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {channel.featuredProducts.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg transition"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions & Subscriber Count */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{(channel.subscribersCount || 1200).toLocaleString()} subscribers</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={subscribed ? 'secondary' : 'primary'}
              size="sm"
              icon={subscribed ? Bell : Sparkles}
              onClick={handleSubscribeToggle}
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
            <Link to={`/channel/${channel.channelId || channel.id}`}>
              <button
                type="button"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                aria-label="Visit Channel"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
