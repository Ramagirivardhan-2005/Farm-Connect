import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Share2,
  Calendar,
  Clock,
  Sparkles,
  Award,
  Store,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle2,
  Package,
  Layers,
  ThumbsUp,
  MapPin,
  Radio,
  UserCheck
} from 'lucide-react';
import StockCard from '../../components/common/StockCard';
import Rating from '../../components/common/Rating';
import Button from '../../components/common/Button';
import ProductCard from '../../components/common/ProductCard';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/common/Toast';
import { productApi, channelApi } from '../../services/api';
import { MOCK_PRODUCTS } from '../../services/mockData';

export default function ProductDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isFollowingFarmer, setIsFollowingFarmer] = useState(false);

  useEffect(() => {
    loadProductData();
  }, [itemId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      // Try backend first
      let prod = null;
      try {
        prod = await productApi.getById(itemId);
      } catch (e) {
        console.warn('Backend fetch failed, falling back:', e);
      }

      if (!prod) {
        prod = MOCK_PRODUCTS.find((p) => String(p.id) === String(itemId)) || MOCK_PRODUCTS[0];
      }

      setProduct(prod);
      setLikeCount(prod?.likeCount || 42);

      // Track view (Instruction 20)
      if (prod?.id) {
        productApi.trackView(prod.id);
      }

      // Fetch related items (Instruction 9)
      try {
        const related = await productApi.getRelated(prod.id || 1);
        if (related && related.length > 0) {
          setRelatedProducts(related);
        } else {
          setRelatedProducts(MOCK_PRODUCTS.filter((p) => p.id !== prod.id).slice(0, 4));
        }
      } catch (err) {
        setRelatedProducts(MOCK_PRODUCTS.filter((p) => p.id !== prod.id).slice(0, 4));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    try {
      const res = await productApi.toggleLike(product?.id || itemId);
      setIsLiked(res?.liked ?? !isLiked);
      setLikeCount(res?.likeCount ?? (isLiked ? likeCount - 1 : likeCount + 1));
      addToast({
        type: 'info',
        title: !isLiked ? 'Saved to Favorites' : 'Removed from Favorites',
        message: !isLiked ? 'Produce saved to your personal list.' : 'Removed.',
      });
    } catch (e) {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    }
  };

  const handleToggleFollow = () => {
    setIsFollowingFarmer(!isFollowingFarmer);
    addToast({
      type: 'success',
      title: !isFollowingFarmer ? 'Farmer Followed!' : 'Unfollowed',
      message: !isFollowingFarmer
        ? `You will now receive notifications when ${product?.farmerName || 'this farmer'} harvests new crops.`
        : 'Unfollowed.',
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    addToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${quantity} ${product.unit || 'KG'} of ${product.name} added to your basket.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/customer/checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast({
      type: 'info',
      title: 'Link Copied',
      message: 'Product link copied to clipboard. Share direct farm harvests with friends & family!',
    });
  };

  if (loading || !product) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium">
        Loading fresh farm produce details...
      </div>
    );
  }

  const primaryImage = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
  const farmerName = product.farmer?.username || product.farmerName || 'Sahyadri Organic Orchards';
  const categoryName = product.category?.name || product.category || 'Fresh Vegetables';
  const channelId = product.channel?.id || product.channelId || 1;

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/customer/dashboard" className="hover:text-farm-700">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600">{categoryName}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 truncate">{product.name}</span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-farm-900/80 backdrop-blur-md text-farm-300 text-xs font-bold uppercase tracking-wider border border-farm-700">
              <Sparkles className="w-3.5 h-3.5 text-farm-400" />
              100% Certified Organic
            </span>

            {/* Like & Share Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                type="button"
                onClick={handleToggleLike}
                className={`p-2.5 rounded-full backdrop-blur-md transition shadow-sm ${
                  isLiked ? 'bg-rose-50 text-rose-600' : 'bg-white/80 text-slate-700 hover:bg-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 backdrop-blur-md transition shadow-sm"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Approximate Distance Pill (Instruction 3) */}
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-emerald-300 text-xs font-bold shadow-xs">
              <MapPin className="w-3.5 h-3.5" />
              <span>2.8 km away • Junnar Farm Gate</span>
            </div>
          </div>
        </div>

        {/* Right Details Column (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* FARMER & CHANNEL CONNECTION (Instruction 8) */}
            <div className="p-4 rounded-2xl bg-farm-50/70 border border-farm-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-farm-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🌱
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sold Directly By</span>
                  <p className="text-sm font-extrabold text-slate-900 leading-tight">{farmerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/channel/${channelId}`}>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-farm-500 text-xs font-bold text-slate-800 transition shadow-2xs"
                  >
                    View Channel
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                    isFollowingFarmer
                      ? 'bg-farm-600 text-white'
                      : 'bg-farm-100 text-farm-800 hover:bg-farm-200'
                  }`}
                >
                  {isFollowingFarmer ? 'Following' : '+ Follow'}
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating, Purchases & Likes */}
            <div className="flex items-center gap-4 text-xs">
              <Rating value={product.rating || 4.9} count={product.reviewsCount || 180} size="sm" />
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                {likeCount} Likes
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock ({product.availableQuantity || product.stockQuantity || 120} {product.unit || 'KG'})
              </span>
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                ₹{product.price}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                per {product.unit || 'KG'}
              </span>
            </div>

            {/* Stock Presentation Card */}
            <StockCard
              available={product.availableQuantity || 120}
              total={product.stockQuantity || 200}
              sold={80}
              unit={product.unit || 'KG'}
              minOrder={1}
            />

            {/* Quantity Selector & Buy Actions */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-l-xl transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-bold text-slate-900 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-r-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Total: ₹{(product.price * quantity).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  icon={ShoppingBag}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Farm Fresh Guarantee */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Produce Details & Soil Integrity</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {product.description || 'Freshly harvested country produce naturally cultivated with vermicompost and indigenous cow manure. Zero chemical pesticides or artificial ripening agents applied.'}
        </p>
      </div>

      {/* RELATED PRODUCTS (Instruction 9) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Related Items You May Like</h3>
          <p className="text-xs text-slate-500">
            Similar harvest produce from the same farming category and nearby fields
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {relatedProducts.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
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
    </div>
  );
}
