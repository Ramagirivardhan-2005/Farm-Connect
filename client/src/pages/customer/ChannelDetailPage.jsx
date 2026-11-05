import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  Pin,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Instagram,
  Youtube,
  Award,
  ShieldCheck,
  Package,
  MessageSquare,
  ThumbsUp,
  Share2,
  Clock,
  Send,
  AlertCircle,
  Radio,
  Heart,
  Repeat
} from 'lucide-react';
import Rating from '../../components/common/Rating';
import Button from '../../components/common/Button';
import ProductCard from '../../components/common/ProductCard';
import { MOCK_CHANNELS, MOCK_PRODUCTS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/common/Toast';
import { postApi } from '../../services/api';

export default function ChannelDetailPage() {
  const { channelId } = useParams();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const channel = MOCK_CHANNELS.find((c) => c.channelId === channelId || c.id === channelId) || MOCK_CHANNELS[0];
  const channelProducts = MOCK_PRODUCTS.filter((p) => p.channel?.channelId === channel.channelId || p.channel?.id === channel.id);

  const [isSubscribed, setIsSubscribed] = useState(channel.isSubscribed || false);
  const [isPinned, setIsPinned] = useState(channel.isPinned || false);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'feed' | 'about' | 'comments'
  const [posts, setPosts] = useState([]);
  const [newComment, setNewComment] = useState('');

  React.useEffect(() => {
    loadChannelFeed();
  }, [channelId]);

  const loadChannelFeed = async () => {
    try {
      const res = await postApi.getChannelPosts(1);
      setPosts(res?.posts || res?.data || []);
    } catch (e) {
      console.warn('Feed load error:', e);
    }
  };

  const handleTogglePostLike = async (postId) => {
    try {
      await postApi.toggleLike(postId);
      loadChannelFeed();
    } catch (e) {}
  };
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'Priya Sharma',
      date: '2 days ago',
      rating: 5,
      text: 'The vine tomatoes arrived still smelling like morning farm dew! Absolutely divine taste for our salads. Will be ordering every week.',
      likes: 14,
      farmerReply: 'Thank you Priya ji! We harvest only after sunrise when sugars are peak. Appreciate your continuous support for our family farm!',
    },
    {
      id: 2,
      user: 'Venkatesh Rao',
      date: '5 days ago',
      rating: 5,
      text: 'Verified organic certification really shows in the taste. Delivery was prompt within 24 hours of plucking.',
      likes: 8,
      farmerReply: null,
    }
  ]);

  const handleSubscribeToggle = () => {
    setIsSubscribed(!isSubscribed);
    addToast({
      type: 'success',
      title: !isSubscribed ? 'Subscribed!' : 'Unsubscribed',
      message: !isSubscribed
        ? `You are now subscribed to ${channel.name}`
        : `Unsubscribed from ${channel.name}`,
    });
  };

  const handlePinToggle = () => {
    setIsPinned(!isPinned);
    addToast({
      type: 'info',
      title: !isPinned ? 'Channel Pinned' : 'Channel Unpinned',
      message: !isPinned ? 'This channel is now pinned to the top of your dashboard.' : 'Unpinned.',
    });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: Date.now(),
      user: currentUser?.username || 'Customer',
      date: 'Just now',
      rating: 5,
      text: newComment.trim(),
      likes: 0,
      farmerReply: null,
    };

    setComments([commentObj, ...comments]);
    setNewComment('');
    addToast({
      type: 'success',
      title: 'Comment Posted',
      message: 'Your review was published to this farmer channel.',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* CHANNEL COVER & BANNER (Instruction 22) */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
        <div className="h-56 sm:h-72 lg:h-80 w-full relative">
          <img
            src={channel.bannerImage}
            alt={channel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

          {/* Top Floating Channel ID & Pin */}
          <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between z-10">
            <span className="font-mono text-xs font-bold text-white bg-black/50 backdrop-blur px-3 py-1 rounded-xl border border-white/20">
              {channel.channelId}
            </span>
            <button
              type="button"
              onClick={handlePinToggle}
              className={`p-2.5 rounded-xl backdrop-blur transition shadow-md ${
                isPinned ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              title={isPinned ? 'Unpin Channel' : 'Pin Channel'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-slate-950' : ''}`} />
            </button>
          </div>
        </div>

        {/* Profile Card Overlay */}
        <div className="bg-white px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
                <img
                  src={channel.profileImage}
                  alt={channel.farmerName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                />
                <span className="absolute -bottom-1 -right-1 p-1.5 bg-farm-600 text-white rounded-full border-2 border-white shadow-sm" title="Active Verified Farmer">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-farm-700 bg-farm-50 px-2.5 py-0.5 rounded-full border border-farm-200">
                  <Sparkles className="w-3 h-3" />
                  <span>{channel.farmingType || 'Organic Farmer'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {channel.name}
                </h1>
                <p className="text-sm font-semibold text-slate-600 flex items-center justify-center sm:justify-start gap-1">
                  <span>Cultivated by {channel.farmerName}</span>
                  <span>•</span>
                  <span className="text-slate-500 flex items-center gap-0.5">
                    <MapPin className="w-3.5 h-3.5 text-farm-600" />
                    {channel.location}
                  </span>
                </p>
              </div>
            </div>

            {/* Subscribe & Contact Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
              <Button
                variant={isSubscribed ? 'secondary' : 'primary'}
                size="md"
                onClick={handleSubscribeToggle}
                icon={Users}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe to Farm'}
              </Button>
              <a href="tel:+919423177654">
                <Button variant="outline" size="md" icon={Phone}>
                  Call Farmer
                </Button>
              </a>
              <a href="mailto:farmer@farmconnect.org">
                <Button variant="outline" size="md" icon={Mail}>
                  Email
                </Button>
              </a>
            </div>
          </div>

          {/* Channel Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Rating</span>
              <div className="mt-0.5">
                <Rating value={channel.rating || 4.9} count={channel.reviewsCount || 420} size="sm" />
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Subscribers</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {(channel.subscribersCount || 3120).toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Farming Experience</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {channel.experience || '25+ Years'}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Completed Orders</span>
              <div className="text-base font-black text-farm-700 mt-0.5">
                1,840+ Dispatched
              </div>
            </div>
          </div>

          {/* Social Links (Instruction 22) */}
          {channel.externalLinks && (
            <div className="flex items-center gap-3 pt-4 text-xs font-semibold text-slate-600">
              <span className="text-slate-400">Farm Links:</span>
              {channel.externalLinks.website && (
                <a
                  href={channel.externalLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-farm-600"
                >
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {channel.externalLinks.instagram && (
                <a
                  href={channel.externalLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-rose-600"
                >
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
              )}
              {channel.externalLinks.youtube && (
                <a
                  href={channel.externalLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-red-600"
                >
                  <Youtube className="w-3.5 h-3.5" /> YouTube Channel
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'products'
              ? 'bg-farm-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Farm Products ({channelProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'feed'
              ? 'bg-farm-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Channel Feed ({posts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'about'
              ? 'bg-farm-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          About Farmer & Certifications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'comments'
              ? 'bg-farm-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Customer Comments & Reviews ({comments.length})
        </button>
      </div>

      {/* TAB CONTENT: CHANNEL FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Direct Farm Gate Updates</h3>
              <p className="text-xs text-slate-500">Live harvest updates and seasonal offers posted directly by the farmer</p>
            </div>
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-farm-600 text-white flex items-center justify-center font-bold text-xs">
                      🌱
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{post.farmerName || channel.name}</p>
                      <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {post.isRepost && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                      <Repeat className="w-3 h-3" /> Reposted Harvest
                    </span>
                  )}
                </div>

                {post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100">
                    <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-slate-900">{post.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{post.content}</p>
                </div>

                {/* Offer Price & Shop CTA */}
                {post.price && (
                  <div className="p-3.5 rounded-2xl bg-farm-50/80 border border-farm-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Harvest Price</span>
                      <span className="text-sm font-black text-farm-900">₹{post.price} / {post.unit || 'KG'}</span>
                    </div>

                    <Link to={post.productId ? `/item/${post.productId}` : '#'}>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-farm-600 hover:bg-farm-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        {post.callToAction || 'Shop Now'} →
                      </button>
                    </Link>
                  </div>
                )}

                {/* Like & Interaction Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleTogglePostLike(post.id)}
                    className="flex items-center gap-1.5 hover:text-rose-600 transition"
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} />
                    <span>{post.likeCount} Likes</span>
                  </button>

                  <span className="flex items-center gap-1.5 text-slate-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentCount} Comments</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Direct From This Farm</h3>
            <span className="text-xs text-slate-500">Zero middleman markup applied</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {channelProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showFarmer={false}
                onAddToCart={(p) => {
                  addToCart(p, 1);
                  addToast({
                    type: 'success',
                    title: 'Added to Cart',
                    message: `${p.name} added to your basket.`,
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ABOUT & CERTIFICATIONS (Instruction 23) */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Farm Bio & Legacy</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{channel.bio}</p>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-farm-600" />
                <span>Verified Agricultural Certifications</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {channel.certifications?.map((cert, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-farm-50/70 border border-farm-200 space-y-1">
                    <span className="text-[10px] font-bold text-farm-800 uppercase tracking-wide">
                      {cert.issuedBy}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900">{cert.name}</h5>
                    <p className="text-[11px] font-mono text-slate-500">Reg: {cert.number}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            {channel.achievements && (
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Farmer Honors & Milestones</span>
                </h4>
                <div className="space-y-2.5">
                  {channel.achievements.map((ach, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <div className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {ach.year}
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{ach.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Farm Guidelines */}
          <div className="bg-farm-900 text-white rounded-3xl p-6 space-y-4 shadow-md">
            <h4 className="text-base font-bold text-farm-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-farm-400" />
              <span>FarmConnect Direct Pledge</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every harvest listed by this channel is verified by FarmConnect district field teams.
              Payments are held in escrow until pickup confirmation.
            </p>
            <div className="pt-2 border-t border-farm-800 space-y-2 text-xs text-farm-200">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-farm-400" />
                <span>Zero chemical carbide ripening</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-farm-400" />
                <span>Cold-chain transit under 24 hrs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-farm-400" />
                <span>Biodegradable craft packaging</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COMMENTS & REVIEWS (Instruction 24) */}
      {activeTab === 'comments' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Farmer Reviews & Channel Comments</h3>
              <p className="text-xs text-slate-500">Share your culinary experience with this farm</p>
            </div>
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a review or question for the farmer..."
              className="flex-1 text-sm rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-farm-600/20"
            />
            <Button type="submit" variant="primary" size="md" icon={Send}>
              Post
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {comments.map((comm) => (
              <div key={comm.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{comm.user}</span>
                    <span className="text-[11px] text-slate-400">• {comm.date}</span>
                  </div>
                  <Rating value={comm.rating} size="xs" />
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{comm.text}</p>

                {/* Farmer Reply (Instruction 24) */}
                {comm.farmerReply && (
                  <div className="ml-4 p-3 rounded-xl bg-farm-50/80 border border-farm-200 text-xs space-y-1">
                    <span className="font-bold text-farm-800 block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-farm-600" />
                      Farmer Response ({channel.farmerName}):
                    </span>
                    <p className="text-slate-700">{comm.farmerReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
