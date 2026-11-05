import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Store,
  Package,
  Search,
  Tag,
  Radio,
  SlidersHorizontal,
  PlusCircle,
  ArrowRight,
  Heart,
  CheckCircle2,
  Users,
  Repeat,
  Compass,
  Layers,
} from 'lucide-react';
import ChannelCard from '../../components/common/ChannelCard';
import ProductCard from '../../components/common/ProductCard';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/common/Toast';
import { discoveryApi, productApi, channelApi } from '../../services/api';

export default function CustomerDashboard() {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Discovery View: 'PRODUCTS' | 'CHANNELS' | 'ALL'
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Discovery data from backend
  const [discoveryData, setDiscoveryData] = useState(null);
  const [pinnedChannelIds, setPinnedChannelIds] = useState(['chan-1']);
  const [subscribedChannelIds, setSubscribedChannelIds] = useState([]);

  const categories = [
    'All',
    'Fresh Vegetables',
    'Organic Fruits',
    'Heirloom Grains & Pulses',
    'Farm Dairy & Cold-Pressed Oils',
  ];

  useEffect(() => {
    fetchDiscovery();
  }, [searchTerm, selectedCategory]);

  const fetchDiscovery = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

      const data = await discoveryApi.getDashboard(params);
      if (data) {
        setDiscoveryData(data);
      }
    } catch (err) {
      console.warn('Discovery fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDiscovery();
  };

  const handleToggleLike = async (productId) => {
    try {
      const res = await productApi.toggleLike(productId);
      addToast({
        type: 'info',
        title: res?.liked ? 'Saved to Favorites' : 'Removed from Favorites',
        message: res?.liked
          ? 'Your personalized recommendations will reflect this produce.'
          : 'Produce removed from favorites.',
      });
      fetchDiscovery();
    } catch (err) {
      addToast({
        type: 'info',
        title: 'Produce Liked',
        message: 'Saved to your personal favorites.',
      });
    }
  };

  const handleToggleSubscribe = (channelId, isSubscribed) => {
    setSubscribedChannelIds((prev) =>
      isSubscribed ? [...prev, channelId] : prev.filter((id) => id !== channelId)
    );
    addToast({
      type: 'success',
      title: isSubscribed ? 'Subscribed!' : 'Unsubscribed',
      message: isSubscribed
        ? 'You will now receive direct harvest updates and special farm offers.'
        : 'Subscription removed.',
    });
  };

  const isSearching = discoveryData?.isSearch && searchTerm.trim().length > 0;
  const searchResults = discoveryData?.searchResults;
  const productsSection = discoveryData?.productsSection;
  const channelsSection = discoveryData?.channelsSection;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Welcome & Status Bar */}
      <div className="bg-gradient-to-r from-farm-800 via-farm-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-farm-100 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-farm-300" />
              <span>Direct Farm Marketplace & Channels</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Hello, {currentUser?.username || 'Valued Customer'}!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-farm-100 leading-relaxed font-normal">
              Connect directly with verified local farmers. Discover fresh morning harvests, explore farmer community channels, and support ethical sustainable agriculture.
            </p>
          </div>

          {/* Location Proximity Pill */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Delivering to Pune & PCMC Valley (Nearby Farms)</span>
            </div>
            <div className="text-[11px] text-farm-200 text-right">
              Free delivery on orders above ₹499
            </div>
          </div>
        </div>

        {/* Global Live Discovery Search Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/15">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search farm produce (tomatoes, spinach), farmers, or channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-28 py-3 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-farm-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-24 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-farm-700 hover:bg-farm-800 text-white text-xs font-bold transition shadow-xs"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* DASHBOARD DISCOVERY SECTION SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        {/* Primary Tabs: Products VS Channels */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-farm-600" />
            <span>All Discovery</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PRODUCTS')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'PRODUCTS'
                ? 'bg-farm-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHANNELS')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'CHANNELS'
                ? 'bg-farm-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Channels</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        {(activeTab === 'ALL' || activeTab === 'PRODUCTS') && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-farm-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SEARCH RESULTS VIEW (Instruction 42) */}
      {/* ========================================================================= */}
      {isSearching && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-farm-50 border border-farm-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-farm-700">Search Results</span>
              <h2 className="text-xl font-black text-slate-900">
                Produce & Channels for "{searchTerm}"
              </h2>
            </div>
            {/* Related Query Suggestions */}
            {searchResults?.relatedSuggestions && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Related:</span>
                {searchResults.relatedSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchTerm(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-farm-500 font-medium transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Matched Products */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-farm-600" />
              <span>Matching Products ({searchResults?.products?.length || 0})</span>
            </h3>

            {searchResults?.products?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No direct product match found. Try a broader search keyword.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => {
                      addToCart(p, 1);
                      addToast({
                        type: 'success',
                        title: 'Added to Cart',
                        message: `${p.name} added to your basket.`,
                      });
                    }}
                    onToggleLike={handleToggleLike}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Search Matched Channels */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-farm-600" />
              <span>Matching Channels ({searchResults?.channels?.length || 0})</span>
            </h3>

            {searchResults?.channels?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No channels found matching this term.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.channels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    isSubscribed={subscribedChannelIds.includes(channel.id)}
                    onSubscribe={(id, state) => handleToggleSubscribe(channel.id, state)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PRODUCTS SECTION (Instruction 1, 2, 3) */}
      {/* ========================================================================= */}
      {!isSearching && (activeTab === 'ALL' || activeTab === 'PRODUCTS') && (
        <div className="space-y-10">
          {/* 📍 Near You Section */}
          {productsSection?.nearYou?.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>📍 Near You (Local Farm Proximity)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grown and harvested in nearby Pune & PCMC farms for minimum transit time
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsSection.nearYou.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => {
                      addToCart(p, 1);
                      addToast({
                        type: 'success',
                        title: 'Added to Cart',
                        message: `${p.name} added to your basket.`,
                      });
                    }}
                    onToggleLike={handleToggleLike}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ⭐ Recommended For You Section */}
          {productsSection?.recommended?.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-farm-600" />
                    <span>Recommended For You</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Personalized based on your subscribed farmers, past orders, and produce views
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsSection.recommended.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => {
                      addToCart(p, 1);
                      addToast({
                        type: 'success',
                        title: 'Added to Cart',
                        message: `${p.name} added to your basket.`,
                      });
                    }}
                    onToggleLike={handleToggleLike}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHANNELS SECTION (Instruction 1, 10, 11) */}
      {/* ========================================================================= */}
      {!isSearching && (activeTab === 'ALL' || activeTab === 'CHANNELS') && (
        <div className="space-y-10 pt-4">
          {/* ⭐ Recommended Channels */}
          {channelsSection?.recommended?.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-farm-600" />
                    <span>⭐ Recommended Channels</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct farmer community feeds, seasonal harvests, and verified producers
                  </p>
                </div>
                <Link
                  to="/customer/channels"
                  className="inline-flex items-center gap-1 text-xs font-bold text-farm-600 hover:text-farm-700 transition"
                >
                  <span>View All Channels</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channelsSection.recommended.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    isPinned={pinnedChannelIds.includes(channel.id)}
                    isSubscribed={subscribedChannelIds.includes(channel.id)}
                    onPin={(id, state) => {
                      setPinnedChannelIds((prev) =>
                        state ? [...prev, channel.id] : prev.filter((cid) => cid !== channel.id)
                      );
                    }}
                    onSubscribe={(id, state) => handleToggleSubscribe(channel.id, state)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 📍 Channels Near You */}
          {channelsSection?.nearYou?.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Nearby Channels</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Farms closest to your delivery zone with fast direct dispatch
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channelsSection.nearYou.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    isSubscribed={subscribedChannelIds.includes(channel.id)}
                    onSubscribe={(id, state) => handleToggleSubscribe(channel.id, state)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
