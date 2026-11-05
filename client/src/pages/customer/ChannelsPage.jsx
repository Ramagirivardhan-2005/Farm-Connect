import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Store, SlidersHorizontal, MapPin } from 'lucide-react';
import ChannelCard from '../../components/common/ChannelCard';
import FilterPanel from '../../components/common/FilterPanel';
import EmptyState from '../../components/common/EmptyState';
import { MOCK_CHANNELS } from '../../services/mockData';
import { useToast } from '../../components/common/Toast';

export default function ChannelsPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { addToast } = useToast();

  const [filters, setFilters] = useState({
    category: '',
    distance: '',
    location: initialSearch,
    rating: '',
    minPrice: '',
    maxPrice: '',
  });

  const [pinnedIds, setPinnedIds] = useState(['chan-1']);
  const [subscribedIds, setSubscribedIds] = useState(['chan-1', 'chan-2']);

  const filteredChannels = useMemo(() => {
    return MOCK_CHANNELS.filter((chan) => {
      if (filters.location) {
        const q = filters.location.toLowerCase();
        const match =
          chan.name.toLowerCase().includes(q) ||
          chan.farmerName.toLowerCase().includes(q) ||
          chan.location.toLowerCase().includes(q) ||
          chan.featuredProducts?.some((p) => p.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (filters.rating && chan.rating < Number(filters.rating)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id);
      const bPinned = pinnedIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [filters, pinnedIds]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-farm-600" />
            <span>Verified Farmer Channels</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Subscribe directly to family farms, view farm stories, and receive freshly harvested produce.
          </p>
        </div>
        <span className="text-xs font-bold text-farm-700 bg-farm-50 px-3 py-1.5 rounded-xl border border-farm-200 self-start sm:self-auto">
          {filteredChannels.length} Verified Farms Available
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Column (Instruction 18) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({
                  category: '',
                  distance: '',
                  location: '',
                  rating: '',
                  minPrice: '',
                  maxPrice: '',
                })
              }
            />
          </div>
        </div>

        {/* Right Channels Grid */}
        <div className="lg:col-span-3">
          {filteredChannels.length === 0 ? (
            <EmptyState
              title="No channels match your criteria"
              description="Try adjusting your filters, location, or search keywords to discover more farms."
              actionLabel="Reset All Filters"
              onAction={() =>
                setFilters({
                  category: '',
                  distance: '',
                  location: '',
                  rating: '',
                  minPrice: '',
                  maxPrice: '',
                })
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isPinned={pinnedIds.includes(channel.id)}
                  isSubscribed={subscribedIds.includes(channel.id)}
                  onPin={(id, state) => {
                    setPinnedIds((prev) =>
                      state ? [...prev, channel.id] : prev.filter((i) => i !== channel.id)
                    );
                    addToast({
                      type: 'info',
                      title: state ? 'Channel Pinned' : 'Channel Unpinned',
                      message: state ? 'Saved to top of your discovery feed.' : 'Restored default sort.',
                    });
                  }}
                  onSubscribe={(id, state) => {
                    setSubscribedIds((prev) =>
                      state ? [...prev, channel.id] : prev.filter((i) => i !== channel.id)
                    );
                    addToast({
                      type: 'success',
                      title: state ? 'Subscribed!' : 'Unsubscribed',
                      message: state ? `Subscribed to ${channel.name}` : `Unsubscribed from ${channel.name}`,
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
