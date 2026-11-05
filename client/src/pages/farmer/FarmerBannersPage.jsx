import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Tag,
  Calendar,
  Eye,
  MousePointerClick,
  Sparkles,
  Store,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { MOCK_BANNERS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

export default function FarmerBannersPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [banners, setBanners] = useState(MOCK_BANNERS);
  const [showModal, setShowModal] = useState(false);

  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    offerCode: 'HARVEST15',
    discountPercent: '15',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-10-08',
    endDate: '2026-11-15',
  });

  const handleCreateBanner = (e) => {
    e.preventDefault();
    const newBanner = {
      id: `ban-${Date.now()}`,
      channelId: currentUser?.channelId || 'FC-CH-00001245',
      channelName: currentUser?.farmerChannel?.name || 'Sahyadri Organic Orchards & Greens',
      farmerName: currentUser?.username || 'Ramesh Patil',
      title: bannerForm.title,
      description: bannerForm.description,
      offerCode: bannerForm.offerCode,
      discountPercent: Number(bannerForm.discountPercent),
      image: bannerForm.image,
      status: 'PENDING_APPROVAL',
      startDate: bannerForm.startDate,
      endDate: bannerForm.endDate,
      viewsCount: 0,
      clicksCount: 0,
    };

    setBanners([newBanner, ...banners]);
    setShowModal(false);
    addToast({
      type: 'success',
      title: 'Promotional Banner Submitted!',
      message: 'Your campaign has been sent to Super Admin for quick verification before appearing on subscriber dashboards.',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-farm-600" />
            <span>Channel Promotional Banners & Seasonal Offers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Display eye-catching seasonal harvest offers directly at the top of your subscribed customers' dashboards.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowModal(true)}
        >
          Create New Campaign Banner
        </Button>
      </div>

      {/* Info Card on Subscriber Visibility (Instruction 21) */}
      <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Subscriber-First Reach (Instruction 21):</strong>
          <p className="text-emerald-800 mt-0.5">
            Approved promotional banners appear prominently on the customer dashboard exclusively for customers who have <strong>subscribed</strong> to your channel. If you have no active promotions, the banner area stays completely clean.
          </p>
        </div>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-44 w-full bg-slate-900">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md ${
                    banner.status === 'ACTIVE'
                      ? 'bg-emerald-600 text-white'
                      : banner.status === 'PENDING_APPROVAL'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {banner.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-black bg-farm-600 text-white px-2 py-1 rounded-full">
                  {banner.discountPercent || 15}% OFF
                </span>
              </div>

              <span className="absolute bottom-3 right-3 text-[10px] font-mono font-bold bg-black/70 text-white px-2.5 py-1 rounded-lg backdrop-blur">
                Code: {banner.offerCode}
              </span>
            </div>

            <div className="p-5 space-y-3 flex-1">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{banner.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{banner.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Valid: {banner.startDate} to {banner.endDate}</span>
                </div>
                <div className="flex items-center gap-3 font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-400" />
                    {banner.viewsCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="w-3 h-3 text-slate-400" />
                    {banner.clicksCount || 0}
                  </span>
                </div>
              </div>

              {banner.rejectionReason && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>Super Admin Feedback:</strong> {banner.rejectionReason}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Banner Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Channel Promotional Banner"
        subtitle="Submit a high-contrast crop banner with seasonal coupon details."
      >
        <form onSubmit={handleCreateBanner} className="space-y-4 pt-2 text-xs">
          <Input
            label="Campaign Headline"
            value={bannerForm.title}
            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
            placeholder="e.g. Alphonso Mango Season Launch: Flat 20% Off Box"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Offer Description & Freshness Highlights
            </label>
            <textarea
              rows={2}
              value={bannerForm.description}
              onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
              placeholder="e.g. Farm-ripened sweet Ratnagiri Alphonso mangoes delivered within 24 hours of plucking..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Promo Code"
              value={bannerForm.offerCode}
              onChange={(e) => setBannerForm({ ...bannerForm, offerCode: e.target.value.toUpperCase() })}
              placeholder="e.g. FRESH20"
              required
            />
            <Input
              label="Discount Percentage (%)"
              type="number"
              value={bannerForm.discountPercent}
              onChange={(e) => setBannerForm({ ...bannerForm, discountPercent: e.target.value })}
              placeholder="e.g. 20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={bannerForm.startDate}
              onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={bannerForm.endDate}
              onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Banner Showcase Image URL (3:1 Panoramic)"
            value={bannerForm.image}
            onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="md" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
