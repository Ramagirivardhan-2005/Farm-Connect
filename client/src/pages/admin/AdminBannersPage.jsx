import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MousePointerClick,
  Sparkles,
  Calendar,
  Tag,
  AlertCircle,
  Store,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { MOCK_BANNERS } from '../../services/mockData';
import { useToast } from '../../components/common/Toast';

export default function AdminBannersPage() {
  const { addToast } = useToast();
  const [banners, setBanners] = useState(MOCK_BANNERS);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter banners
  const filteredBanners = banners.filter((b) => {
    if (activeTab !== 'ALL' && b.status !== activeTab) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.channelName.toLowerCase().includes(q) ||
        b.offerCode?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = banners.filter((b) => b.status === 'PENDING_APPROVAL').length;

  const handleApprove = (bannerId) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, status: 'ACTIVE' } : b))
    );
    addToast({
      type: 'success',
      title: 'Promotional Banner Approved',
      message: 'Banner is now active and visible to subscribed customers on their dashboard.',
    });
  };

  const handleOpenReject = (banner) => {
    setSelectedBanner(banner);
    setRejectionReason('Does not meet visual contrast or resolution guidelines.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedBanner) return;
    setBanners((prev) =>
      prev.map((b) =>
        b.id === selectedBanner.id
          ? { ...b, status: 'REJECTED', rejectionReason }
          : b
      )
    );
    addToast({
      type: 'info',
      title: 'Banner Rejected',
      message: 'Farmer has been notified with revision notes.',
    });
    setRejectModalOpen(false);
    setSelectedBanner(null);
  };

  const handleToggleDeactivate = (bannerId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'REJECTED' : 'ACTIVE';
    setBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, status: nextStatus } : b))
    );
    addToast({
      type: 'info',
      title: nextStatus === 'ACTIVE' ? 'Banner Re-activated' : 'Banner Taken Down',
      message: nextStatus === 'ACTIVE' ? 'Banner is live again.' : 'Banner removed from customer dashboards.',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-farm-600" />
            <span>Farmer Promotional Banners Oversight</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and moderate seasonal discount banners submitted by verified farmers for their subscribed channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-farm-800 bg-farm-50 px-3.5 py-1.5 rounded-xl border border-farm-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-farm-600" />
            <span>{pendingCount} Pending Review</span>
          </span>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: 'ALL', label: 'All Banners' },
            { id: 'PENDING_APPROVAL', label: `Pending Approval (${pendingCount})`, badge: pendingCount > 0 },
            { id: 'ACTIVE', label: 'Active Live Banners' },
            { id: 'REJECTED', label: 'Rejected / Inactive' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-farm-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search channel or code..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-farm-600/20"
          />
        </div>
      </div>

      {/* Banners Grid */}
      {filteredBanners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-800 text-sm">No Promotional Banners Found</p>
          <p>No banners match the selected status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              {/* Image Preview with overlay tags */}
              <div className="relative h-48 w-full bg-slate-900">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs ${
                      banner.status === 'ACTIVE'
                        ? 'bg-emerald-600/90 text-white'
                        : banner.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-500/90 text-white'
                        : 'bg-rose-600/90 text-white'
                    }`}
                  >
                    {banner.status.replace('_', ' ')}
                  </span>
                  {banner.discountPercent && (
                    <span className="text-[10px] font-black bg-farm-600/90 text-white px-2 py-1 rounded-full">
                      {banner.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <span className="absolute bottom-3 right-3 text-[10px] font-mono font-bold bg-black/70 text-white px-2.5 py-1 rounded-lg backdrop-blur">
                  Code: {banner.offerCode || 'FRESHDEAL'}
                </span>
              </div>

              {/* Banner Details */}
              <div className="p-5 space-y-3 flex-1">
                <div>
                  <span className="text-[11px] font-bold text-farm-700 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" />
                    <span>{banner.channelName}</span>
                    <span className="text-slate-400 font-normal">({banner.farmerName || 'Farmer'})</span>
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {banner.description}
                  </p>
                </div>

                {/* Campaign Validity & Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Valid: <strong>{banner.startDate}</strong> to <strong>{banner.endDate}</strong></span>
                  </div>
                  <div className="flex items-center justify-end gap-3 font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      {banner.viewsCount || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3 text-slate-400" />
                      {banner.clicksCount || 0} clicks
                    </span>
                  </div>
                </div>

                {banner.rejectionReason && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Moderator Note:</strong> {banner.rejectionReason}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono">ID: {banner.id}</span>

                <div className="flex items-center gap-2">
                  {banner.status === 'PENDING_APPROVAL' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleOpenReject(banner)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleApprove(banner.id)}
                      >
                        Approve & Publish
                      </Button>
                    </>
                  ) : banner.status === 'ACTIVE' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleDeactivate(banner.id, 'ACTIVE')}
                      className="text-slate-600 hover:text-rose-600"
                    >
                      Take Down Banner
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleDeactivate(banner.id, 'REJECTED')}
                    >
                      Re-Approve Live
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Promotional Banner"
        subtitle={`Provide feedback to ${selectedBanner?.channelName} for banner revision.`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Rejection / Modification Notes
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please increase contrast or update coupon expiry date..."
              className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="md" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmReject}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
