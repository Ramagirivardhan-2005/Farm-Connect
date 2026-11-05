import React, { useState, useEffect } from 'react';
import {
  Radio,
  PlusCircle,
  Repeat,
  Heart,
  MessageSquare,
  Eye,
  Tag,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShoppingBag,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { postApi, channelApi } from '../../services/api';

export default function FarmerPostsPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('KG');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [category, setCategory] = useState('Fresh Vegetables');
  const [tags, setTags] = useState('Farm Fresh, Direct Harvest');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadFarmerChannels();
  }, []);

  useEffect(() => {
    if (selectedChannelId) {
      loadChannelPosts(selectedChannelId);
    }
  }, [selectedChannelId]);

  const loadFarmerChannels = async () => {
    try {
      const res = await channelApi.getAll();
      const chList = Array.isArray(res) ? res : res?.channels || res?.data || [];
      setChannels(chList);
      if (chList.length > 0) {
        setSelectedChannelId(chList[0].id || chList[0]._id || 1);
      }
    } catch (e) {
      console.warn('Error loading channels:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadChannelPosts = async (channelId) => {
    try {
      setLoading(true);
      const res = await postApi.getChannelPosts(channelId);
      setPosts(res?.posts || res?.data || []);
    } catch (e) {
      console.warn('Error loading posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!title.trim() || !content.trim()) {
      setErrorMessage('Please provide both a title and post description.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        content: content.trim(),
        price: price ? parseFloat(price) : null,
        unit,
        discountPercent: parseInt(discountPercent) || 0,
        category,
        tags,
        mediaUrl: mediaUrl.trim() || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        callToAction: 'Shop Now',
      };

      const res = await postApi.createPost(selectedChannelId, payload);
      addToast({
        type: 'success',
        title: 'Post Published!',
        message: 'Your fresh harvest post is now live on the channel feed.',
      });

      setShowCreateModal(false);
      setTitle('');
      setContent('');
      setPrice('');
      setMediaUrl('');
      loadChannelPosts(selectedChannelId);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to publish post.';
      setErrorMessage(msg);
      addToast({
        type: 'error',
        title: 'Posting Restricted',
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleControlledRepost = async (postId) => {
    try {
      await postApi.repost(postId);
      addToast({
        type: 'success',
        title: 'Controlled Repost Successful',
        message: 'Post bumped to the top of your channel feed with freshness refreshed.',
      });
      loadChannelPosts(selectedChannelId);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Repost Failed',
        message: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-farm-700 to-farm-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-farm-200 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 text-farm-300" />
            <span>Farmer Community Channel Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Channel Feed & Harvest Posts</h1>
          <p className="mt-1 text-xs sm:text-sm text-farm-100 max-w-xl">
            Publish harvest announcements, special weekend offers, and direct farm updates.
            Protected by anti-spam cooldowns and controlled repost capabilities.
          </p>
        </div>

        <Button
          variant="secondary"
          size="lg"
          icon={PlusCircle}
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-farm-800 hover:bg-farm-50 border-0 font-bold shadow-md shrink-0"
        >
          New Harvest Post
        </Button>
      </div>

      {/* Channel Switcher */}
      {channels.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Channel:</span>
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannelId(ch.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedChannelId === ch.id
                  ? 'bg-farm-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>
      )}

      {/* Feed Posts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>Active Channel Feed</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-farm-100 text-farm-800 font-bold">
            {posts.length} Posts
          </span>
        </h2>

        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-farm-50 flex items-center justify-center text-farm-600">
              <Radio className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Posts Published Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Engage your subscribed customers by posting harvest updates, seasonal fruit arrivals, or special discounts!
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => setShowCreateModal(true)}
              className="mt-2"
            >
              Create Your First Post
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  {/* Media Banner */}
                  {post.mediaUrl && (
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {post.isRepost && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                          <Repeat className="w-3 h-3 text-indigo-300" />
                          Reposted
                        </span>
                      )}
                      {post.discountPercent > 0 && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase shadow-xs">
                          {post.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.repostCount > 0 && (
                        <span className="text-indigo-600 font-semibold flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          {post.repostCount} Reposts
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{post.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{post.content}</p>

                    {/* Price & Quantity Tag */}
                    {post.price && (
                      <div className="inline-flex items-baseline gap-1.5 px-3 py-1 rounded-xl bg-farm-50 border border-farm-200 text-farm-900 font-black text-sm">
                        <span>₹{post.price}</span>
                        <span className="text-[11px] font-semibold text-slate-500">/ {post.unit || 'KG'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1 text-rose-600">
                      <Heart className="w-3.5 h-3.5 fill-rose-600" />
                      {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {post.commentCount}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Eye className="w-3.5 h-3.5" />
                      {post.viewCount}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleControlledRepost(post.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-farm-500 text-slate-700 hover:text-farm-700 text-xs font-bold shadow-2xs transition"
                    title="Bump this post to top of channel feed"
                  >
                    <Repeat className="w-3.5 h-3.5 text-farm-600" />
                    <span>Repost</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Publish Harvest Post</h3>
                <p className="text-xs text-slate-500">Reach your subscribed customers instantly</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Post Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawn Harvest: Certified Organic Country Tomatoes!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-farm-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Harvest Description & Tasting Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the freshness, soil conditions, and farm harvest timing..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-farm-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="40"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-farm-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-farm-500 focus:outline-none bg-white"
                  >
                    <option value="KG">KG</option>
                    <option value="Bundle">Bundle</option>
                    <option value="Dozen">Dozen</option>
                    <option value="Box">Box</option>
                    <option value="Litre">Litre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-farm-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo / Media URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-farm-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category & Tags</label>
                <input
                  type="text"
                  placeholder="Organic, Tomatoes, Zero Chemical"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-farm-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-farm-600 shrink-0" />
                <span>Anti-Spam Notice: Repetitive identical posts are restricted for 30 minutes. Use "Repost" for past harvest updates.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                >
                  Publish to Channel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
