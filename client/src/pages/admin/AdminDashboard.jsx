import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Sprout,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  FileCheck,
  Truck,
  Layers,
  Activity,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Button from '../../components/common/Button';

export default function AdminDashboard() {
  // Metrics per Instruction 64
  const metrics = [
    { label: 'Total Users', value: '48,210', icon: Users, color: 'text-purple-600 bg-purple-100' },
    { label: 'Total Farmers', value: '2,420', icon: Sprout, color: 'text-farm-600 bg-farm-100' },
    { label: 'Active Channels', value: '1,890', icon: Store, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Total Products', value: '12,450', icon: Package, color: 'text-sky-600 bg-sky-100' },
    { label: 'Total Orders', value: '184,300', icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'GMV Revenue', value: '₹4.82 Cr', icon: DollarSign, color: 'text-emerald-700 bg-emerald-100' },
    { label: 'Pending Verifications', value: '14', icon: FileCheck, color: 'text-amber-600 bg-amber-100' },
    { label: 'Active Delivery Partners', value: '620', icon: Truck, color: 'text-teal-600 bg-teal-100' },
  ];

  const quickSections = [
    {
      title: 'Farmer Channel Verification Review',
      desc: 'Review 14 submitted applications with Aadhaar, APEDA organic proofs, and bank accounts.',
      path: '/admin/verifications',
      badge: '14 Pending',
      icon: FileCheck,
    },
    {
      title: 'Hero Content CMS',
      desc: 'Manage promotional hero banners, carousel images, headings, and CTAs on the login page.',
      path: '/admin/hero-content',
      badge: '3 Active Slides',
      icon: ImageIcon,
    },
    {
      title: 'Farmer Promotional Banners',
      desc: 'Review discount and festival harvest banners created by farmers prior to publishing.',
      path: '/admin/banners',
      badge: '2 In Review',
      icon: Layers,
    },
    {
      title: 'Security & Audit Logs',
      desc: 'Inspect tamper-evident system logs: state machine transitions, logins, and approvals.',
      path: '/admin/audit-logs',
      badge: 'Audit Active',
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-farm-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>FarmConnect Super Admin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            System Operations & Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Complete platform oversight: verify farmers, regulate channels, approve marketing hero content, inspect financial audit logs, and enforce compliance.
          </p>
        </div>
      </div>

      {/* Metrics Grid (Instruction 64) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {m.label}
                </span>
                <div className={`p-2 rounded-xl ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {m.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Management Sections Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900">Governance & Administrative Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickSections.map((sec, i) => {
            const Icon = sec.icon;
            return (
              <Link
                key={i}
                to={sec.path}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-farm-300 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                      {sec.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-farm-600 transition">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-bold text-farm-600 gap-1">
                  <span>Open Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
