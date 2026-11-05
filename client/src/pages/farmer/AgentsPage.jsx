import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Star,
  Radio,
  Upload,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

const API_BASE = '/api';

const MOCK_AGENTS = [
  {
    _id: 'da-1',
    deliveryAgentId: 'DP-001',
    fullName: 'Rahul Kumar',
    email: 'rahul.kumar@deliveries.com',
    mobile: '+91 98765 00001',
    altPhone: '+91 87654 00001',
    address: { house: 'Flat 201', street: 'MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    status: 'AVAILABLE',
    isEmailVerified: true,
    totalDeliveries: 245,
    activeDeliveries: 1,
    rating: 4.8,
    assignedChannels: ['Pune Metro'],
  },
  {
    _id: 'da-2',
    deliveryAgentId: 'DP-002',
    fullName: 'Suresh Express Rider',
    email: 'suresh.rider@deliveries.com',
    mobile: '+91 98765 00002',
    altPhone: '',
    address: { house: '12, Shivaji Nagar', street: 'FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411004' },
    status: 'ON_DELIVERY',
    isEmailVerified: true,
    totalDeliveries: 342,
    activeDeliveries: 2,
    rating: 4.9,
    assignedChannels: ['Pune Metro', 'PCMC Zone'],
  },
];

export default function AgentsPage() {
  const { addToast } = useToast();
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newAgent, setNewAgent] = useState({
    fullName: '',
    mobile: '',
    email: '',
    altPhone: '',
    house: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('farmconnect_token');
      const res = await fetch(`${API_BASE}/farmers/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.agents?.length) setAgents(data.agents);
      }
    } catch { /* use mock */ }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('farmconnect_token');
      const res = await fetch(`${API_BASE}/farmers/agents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      });
      if (res.ok) {
        const data = await res.json();
        setAgents((prev) => [...prev, data.deliveryPartner]);
        addToast({ type: 'success', title: 'Agent Added', message: `${newAgent.fullName} created. Verification email sent.` });
      } else {
        const demo = {
          _id: `da-${Date.now()}`,
          deliveryAgentId: `DP-${Math.floor(Math.random() * 900 + 100)}`,
          fullName: newAgent.fullName,
          email: newAgent.email,
          mobile: newAgent.mobile,
          altPhone: newAgent.altPhone,
          address: { house: newAgent.house, street: newAgent.street, city: newAgent.city, state: newAgent.state, pincode: newAgent.pincode },
          status: 'PENDING_VERIFICATION',
          isEmailVerified: false,
          totalDeliveries: 0,
          activeDeliveries: 0,
          rating: 0,
          assignedChannels: [],
        };
        setAgents((prev) => [...prev, demo]);
        addToast({ type: 'success', title: 'Agent Added (Demo)', message: `${newAgent.fullName} created locally. In production, a verification email will be sent.` });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Could not add agent.' });
    } finally {
      setIsSubmitting(false);
      setShowAddModal(false);
      setNewAgent({ fullName: '', mobile: '', email: '', altPhone: '', house: '', street: '', city: '', state: '', pincode: '' });
    }
  };

  const statusColors = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    ON_DELIVERY: 'bg-sky-100 text-sky-700 border-sky-200',
    OFFLINE: 'bg-slate-100 text-slate-500 border-slate-200',
    PENDING_VERIFICATION: 'bg-amber-100 text-amber-700 border-amber-200',
    SUSPENDED: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-farm-600" />
            <span>Delivery Agents</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your delivery team. Add new agents or view profiles and assign to channels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/farmer/delivery-channels">
            <Button variant="outline" size="md" icon={Radio}>Delivery Channels</Button>
          </Link>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add New Agent
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: agents.length },
          { label: 'Available', value: agents.filter((a) => a.status === 'AVAILABLE').length },
          { label: 'On Delivery', value: agents.filter((a) => a.status === 'ON_DELIVERY').length },
          { label: 'Avg Rating', value: agents.filter((a) => a.rating > 0).length ? (agents.reduce((s, a) => s + (a.rating || 0), 0) / agents.filter((a) => a.rating > 0).length).toFixed(1) + '★' : 'N/A' },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-white rounded-2xl border border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div
            key={agent._id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-farm-300 transition cursor-pointer"
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                {agent.fullName?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{agent.fullName}</h3>
                  {agent.isEmailVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </div>
                <p className="font-mono text-[10px] font-bold text-slate-400 mt-0.5">{agent.deliveryAgentId}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{agent.mobile}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{agent.email}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusColors[agent.status] || statusColors.OFFLINE}`}>
                {agent.status?.replace('_', ' ')}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>✓ <strong className="text-slate-900">{agent.totalDeliveries}</strong> Completed</span>
              <span>📦 <strong className="text-slate-900">{agent.activeDeliveries}</strong> Active</span>
              {agent.rating > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />{agent.rating}
                </span>
              )}
              {agent.assignedChannels?.length > 0 && (
                <span className="text-farm-600 font-semibold">{agent.assignedChannels.length} channel(s)</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <Truck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 mb-2">No Delivery Agents Yet</h3>
          <p className="text-xs text-slate-500 mb-4">Add your first delivery agent to start managing deliveries.</p>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setShowAddModal(true)}>Add First Agent</Button>
        </div>
      )}

      {/* Agent Detail Modal */}
      <Modal isOpen={!!selectedAgent} onClose={() => setSelectedAgent(null)} title="Delivery Agent Profile">
        {selectedAgent && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-700 text-white flex items-center justify-center font-black text-2xl">
                {selectedAgent.fullName?.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedAgent.fullName}</h3>
                <p className="font-mono text-xs text-slate-400">{selectedAgent.deliveryAgentId}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[selectedAgent.status] || statusColors.OFFLINE}`}>
                  {selectedAgent.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-slate-400 font-bold mb-1">Contact</p>
                <p className="text-slate-900 font-semibold">{selectedAgent.mobile}</p>
                {selectedAgent.altPhone && <p className="text-slate-500">{selectedAgent.altPhone}</p>}
                <p className="text-slate-500 truncate">{selectedAgent.email}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-slate-400 font-bold mb-1">Performance</p>
                <p className="text-slate-900 font-semibold">{selectedAgent.totalDeliveries} completed</p>
                <p className="text-slate-500">{selectedAgent.activeDeliveries} active now</p>
                {selectedAgent.rating > 0 && <p className="text-amber-600 font-bold">{selectedAgent.rating}★ rating</p>}
              </div>
            </div>
            {selectedAgent.address && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                <p className="text-slate-400 font-bold mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />Address</p>
                <p className="text-slate-900">{selectedAgent.address.house}, {selectedAgent.address.street}, {selectedAgent.address.city}, {selectedAgent.address.state} - {selectedAgent.address.pincode}</p>
              </div>
            )}
            {selectedAgent.assignedChannels?.length > 0 && (
              <div className="bg-farm-50 p-3 rounded-2xl border border-farm-100 text-xs">
                <p className="text-farm-700 font-bold mb-2 flex items-center gap-1"><Radio className="w-3 h-3" />Assigned Channels</p>
                <div className="flex flex-wrap gap-1">
                  {selectedAgent.assignedChannels.map((ch) => (
                    <span key={ch} className="px-2 py-0.5 bg-farm-100 text-farm-800 rounded-md font-semibold">{ch}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add New Agent Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Delivery Agent" subtitle="Create account and send verification email">
        <form onSubmit={handleAddAgent} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Full Name" value={newAgent.fullName} onChange={(e) => setNewAgent({ ...newAgent, fullName: e.target.value })} placeholder="Agent's full name" required />
            <Input label="Mobile Number" type="tel" value={newAgent.mobile} onChange={(e) => setNewAgent({ ...newAgent, mobile: e.target.value })} placeholder="+91 98765 43210" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Email Address" type="email" value={newAgent.email} onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })} placeholder="agent@email.com" required />
            <Input label="Alt. Mobile (optional)" type="tel" value={newAgent.altPhone} onChange={(e) => setNewAgent({ ...newAgent, altPhone: e.target.value })} placeholder="+91 87654 00000" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="House / Flat No." value={newAgent.house} onChange={(e) => setNewAgent({ ...newAgent, house: e.target.value })} placeholder="Flat 301" />
            <Input label="Street / Colony" value={newAgent.street} onChange={(e) => setNewAgent({ ...newAgent, street: e.target.value })} placeholder="MG Road" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input label="City" value={newAgent.city} onChange={(e) => setNewAgent({ ...newAgent, city: e.target.value })} placeholder="Pune" required />
            <Input label="State" value={newAgent.state} onChange={(e) => setNewAgent({ ...newAgent, state: e.target.value })} placeholder="Maharashtra" required />
            <Input label="PIN Code" value={newAgent.pincode} onChange={(e) => setNewAgent({ ...newAgent, pincode: e.target.value })} placeholder="411001" required />
          </div>
          <p className="text-[11px] text-slate-400 bg-amber-50 p-3 rounded-xl border border-amber-100">
            A verification email with login credentials will be sent to the provided email address. The agent must verify before accessing their dashboard.
          </p>
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" loading={isSubmitting}>Create Agent</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
