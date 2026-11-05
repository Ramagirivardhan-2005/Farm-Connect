import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Store,
  Eye,
  MapPin,
  Award
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/Toast';

export default function AdminVerificationsPage() {
  const { addToast } = useToast();

  const [applications, setApplications] = useState([
    {
      id: 'app-1',
      channelId: 'FC-CH-00002194',
      farmerName: 'Hanumant Rao Shinde',
      contact: '+91 94220 55112',
      farmLocation: 'Satara District, Maharashtra',
      landArea: '18.5 Acres',
      farmingMethod: 'Natural / ZBNF & Subhash Palekar Method',
      channelName: 'Shinde Heritage Cow-Based Natural Farms',
      aadhaarStatus: 'Encrypted & Authenticated (AES-256)',
      bankStatus: 'Penny-Drop Bank Verified (SBI IFSC: SBIN0000412)',
      certifications: 'Jaivik Bharat / PKVY Organic Certification (2024–2027)',
      status: 'PENDING_VERIFICATION',
      submittedAt: 'Today, 9:30 AM',
    },
    {
      id: 'app-2',
      channelId: 'FC-CH-00002201',
      farmerName: 'Saraswathi Natarajan',
      contact: '+91 98412 88901',
      farmLocation: 'Thanjavur Delta, Tamil Nadu',
      landArea: '12 Acres',
      farmingMethod: 'Organic Heirloom Rice & Greens',
      channelName: 'Kaveri Delta Heritage Paddy Farms',
      aadhaarStatus: 'Encrypted & Authenticated (AES-256)',
      bankStatus: 'Penny-Drop Bank Verified (Canara Bank)',
      certifications: 'NPOP Organic Scope Certificate',
      status: 'PENDING_VERIFICATION',
      submittedAt: 'Yesterday, 4:15 PM',
    }
  ]);

  const [selectedApp, setSelectedApp] = useState(null);

  const handleAction = (appId, action) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: action } : app))
    );
    setSelectedApp(null);
    addToast({
      type: action === 'VERIFIED' ? 'success' : action === 'REJECTED' ? 'error' : 'warning',
      title: `Application ${action}`,
      message: `Farmer channel application was updated to ${action}. Audit log logged.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-purple-600" />
          <span>Farmer Channel Verification Review (KYF - Know Your Farmer)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review land credentials, agricultural certifications, encrypted Aadhaar proofs, and penny-drop bank settlements.
        </p>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  {app.channelId}
                </span>
                <span className="text-xs text-slate-400">Submitted: {app.submittedAt}</span>
              </div>
              <StatusBadge status={app.status} type="channel" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Farmer & Farm</span>
                <h4 className="text-sm font-bold text-slate-900">{app.farmerName}</h4>
                <p className="text-slate-600">{app.contact}</p>
                <p className="text-slate-500">{app.farmLocation} ({app.landArea})</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Channel & Practice</span>
                <h4 className="text-sm font-bold text-slate-900">{app.channelName}</h4>
                <p className="text-farm-700 font-semibold">{app.farmingMethod}</p>
                <p className="text-slate-500">{app.certifications}</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Compliance Checks</span>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{app.aadhaarStatus}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{app.bankStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions (Instruction 69) */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleAction(app.id, 'VERIFIED')}
              >
                Approve & Activate Channel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={AlertTriangle}
                onClick={() => handleAction(app.id, 'CHANGES_REQUESTED')}
              >
                Request Land Title Changes
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => handleAction(app.id, 'REJECTED')}
              >
                Reject Application
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
