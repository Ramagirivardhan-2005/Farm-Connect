import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  Plus,
  Users,
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Trash2,
  X,
  Edit2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

const API_BASE = '/api';

const MOCK_CHANNELS = [
  {
    _id: 'ch-001',
    channelId: 'FC-CH-001',
    name: 'Pune Metro Deliveries',
    status: 'ACTIVE',
    deliveryAgents: [
      { _id: 'da-1', fullName: 'Rahul Kumar', mobile: '+91 98765 00001', status: 'AVAILABLE' },
      { _id: 'da-2', fullName: 'Suresh Rider', mobile: '+91 98765 00002', status: 'ON_DELIVERY' },
    ],
    defaultDeliveryFee: 60,
    freeDeliveryThreshold: 499,
    createdAt: new Date().toISOString(),
  },
];

export default function DeliveryChannelsPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [channels, setChannels] = useState(MOCK_CHANNELS);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState([]);

  const [newChannel, setNewChannel] = useState({
    name: '',
    defaultDeliveryFee: 60,
    freeDeliveryThreshold: 499,
  });

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('farmconnect_token');
      const res = await fetch(`${API_BASE}/farmers/channels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || MOCK_CHANNELS);
      }
    } catch {
      setChannels(MOCK_CHANNELS);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAgents = async () => {
    try {
      const token = localStorage.getItem('farmconnect_token');
      const res = await fetch(`${API_BASE}/farmers/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableAgents(data.agents || []);
      }
    } catch {
      setAvailableAgents([]);
    }
  };

  useEffect(() => { fetchChannels(); }, []);

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannel.name.trim()) return;
    try {
      const token = localStorage.getItem('farmconnect_token');
      const res = await fetch(`${API_BASE}/farmers/channels`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newChannel),
      });
      if (res.ok) {
        const data = await res.json();
        setChannels((prev) => [...prev, data.channel]);
        addToast({ type: 'success', title: 'Channel Created', message: `"${newChannel.name}" is now active.` });
      } else {
        // Demo fallback
        const demo = {
          _id: `ch-${Date.now()}`,
          channelId: `FC-CH-${Math.floor(Math.random() * 9000 + 1000)}`,
          name: newChannel.name,
          status: 'ACTIVE',
          deliveryAgents: [],
          defaultDeliveryFee: newChannel.defaultDeliveryFee,
          freeDeliveryThreshold: newChannel.freeDeliveryThreshold,
          createdAt: new Date().toISOString(),
        };
        setChannels((prev) => [...prev, demo]);
        addToast({ type: 'success', title: 'Channel Created', message: `"${newChannel.name}" is now active.` });
      }
    } catch {
      const demo = {
        _id: `ch-${Date.now()}`,
        channelId: `FC-CH-${Math.floor(Math.random() * 9000 + 1000)}`,
        name: newChannel.name,
        status: 'ACTIVE',
        deliveryAgents: [],
        defaultDeliveryFee: newChannel.defaultDeliveryFee,
        freeDeliveryThreshold: newChannel.freeDeliveryThreshold,
        createdAt: new Date().toISOString(),
      };
      setChannels((prev) => [...prev, demo]);
      addToast({ type: 'success', title: 'Channel Created (Demo)', message: `"${newChannel.name}" added locally.` });
    }
    setShowCreateModal(false);
    setNewChannel({ name: '', defaultDeliveryFee: 60, freeDeliveryThreshold: 499 });
  };

  const handleOpenAgentsModal = async (channel) => {
    setSelectedChannel(channel);
    await fetchAvailableAgents();
    setSelectedAgentIds([]);
    setShowAgentsModal(true);
  };

  const handleAssignAgents = async () => {
    if (!selectedAgentIds.length) {
      addToast({ type: 'error', title: 'No agents selected', message: 'Please select at least one agent to assign.' });
      return;
    }
    try {
      const token = localStorage.getItem('farmconnect_token');
      const res = await fetch(`${API_BASE}/farmers/channels/${selectedChannel._id}/agents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentIds: selectedAgentIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setChannels((prev) => prev.map((c) => c._id === selectedChannel._id ? { ...c, deliveryAgents: data.channel?.deliveryAgents || c.deliveryAgents } : c));
        addToast({ type: 'success', title: 'Agents Assigned', message: `${selectedAgentIds.length} agent(s) added to "${selectedChannel.name}".` });
      } else {
        addToast({ type: 'info', title: 'Saved (Demo)', message: 'Agents assigned in demo mode.' });
      }
    } catch {
      addToast({ type: 'info', title: 'Saved (Demo)', message: 'Agents assigned in demo mode.' });
    }
    setShowAgentsModal(false);
  };

  const handleRemoveAgent = async (channelId, agentId) => {
    try {
      const token = localStorage.getItem('farmconnect_token');
      await fetch(`${API_BASE}/farmers/channels/${channelId}/agents/${agentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setChannels((prev) =>
        prev.map((c) =>
          c._id === channelId
            ? { ...c, deliveryAgents: c.deliveryAgents.filter((a) => a._id !== agentId) }
            : c
        )
      );
      addToast({ type: 'success', title: 'Agent Removed', message: 'Agent removed from channel.' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Could not remove agent.' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-farm-600" />
            <span>Delivery Channels</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create and manage delivery groups. Assign agents to handle orders for your farm.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/farmer/agents">
            <Button variant="outline" size="md" icon={Truck}>
              Manage Agents
            </Button>
          </Link>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setShowCreateModal(true)}>
            Create Channel
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Channels', value: channels.length, color: 'bg-farm-50 border-farm-200 text-farm-900' },
          { label: 'Active Channels', value: channels.filter((c) => c.status === 'ACTIVE').length, color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
          { label: 'Total Agents', value: channels.reduce((s, c) => s + (c.deliveryAgents?.length || 0), 0), color: 'bg-sky-50 border-sky-200 text-sky-900' },
          { label: 'Avg Fee', value: `₹${channels.length ? Math.round(channels.reduce((s, c) => s + c.defaultDeliveryFee, 0) / channels.length) : 0}`, color: 'bg-amber-50 border-amber-200 text-amber-900' },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-2xl border ${stat.color}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{stat.label}</p>
            <p className="text-2xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Channels List */}
      <div className="space-y-4">
        {channels.map((channel) => (
          <div key={channel._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{channel.name}</h3>
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {channel.channelId}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    channel.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {channel.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Delivery Fee: <strong className="text-slate-900">₹{channel.defaultDeliveryFee}</strong></span>
                  <span>Free above: <strong className="text-slate-900">₹{channel.freeDeliveryThreshold}</strong></span>
                  <span>Agents: <strong className="text-slate-900">{channel.deliveryAgents?.length || 0}</strong></span>
                </div>
              </div>
              <Button variant="outline" size="sm" icon={Users} onClick={() => handleOpenAgentsModal(channel)}>
                Assign Agents
              </Button>
            </div>

            {/* Assigned Agents */}
            {channel.deliveryAgents?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Assigned Delivery Agents ({channel.deliveryAgents.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {channel.deliveryAgents.map((agent) => (
                    <div key={agent._id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold text-xs">
                          {agent.fullName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{agent.fullName}</p>
                          <p className="text-[11px] text-slate-400">{agent.mobile}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          agent.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : agent.status === 'ON_DELIVERY'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {agent.status?.replace('_', ' ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAgent(channel._id, agent._id)}
                          className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                          title="Remove from channel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {channel.deliveryAgents?.length === 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-center py-4">
                <Truck className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No delivery agents assigned yet.</p>
                <button
                  type="button"
                  onClick={() => handleOpenAgentsModal(channel)}
                  className="text-xs font-bold text-farm-600 hover:text-farm-700 mt-1"
                >
                  + Assign Agents
                </button>
              </div>
            )}
          </div>
        ))}

        {channels.length === 0 && (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
            <Radio className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800 mb-2">No Delivery Channels Yet</h3>
            <p className="text-xs text-slate-500 mb-4">Create your first delivery channel to start assigning agents to your orders.</p>
            <Button variant="primary" size="md" icon={Plus} onClick={() => setShowCreateModal(true)}>
              Create First Channel
            </Button>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Delivery Channel" subtitle="Set up a new group for managing delivery agents">
        <form onSubmit={handleCreateChannel} className="space-y-4 pt-2">
          <Input
            label="Channel Name"
            value={newChannel.name}
            onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
            placeholder="e.g. Pune Metro Deliveries"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Default Delivery Fee (₹)"
              type="number"
              value={newChannel.defaultDeliveryFee}
              onChange={(e) => setNewChannel({ ...newChannel, defaultDeliveryFee: Number(e.target.value) })}
              min={0}
              max={100}
            />
            <Input
              label="Free Delivery Above (₹)"
              type="number"
              value={newChannel.freeDeliveryThreshold}
              onChange={(e) => setNewChannel({ ...newChannel, freeDeliveryThreshold: Number(e.target.value) })}
              min={0}
            />
          </div>
          <p className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
            Max delivery fee is capped at ₹100. Orders above the free delivery threshold get free delivery.
          </p>
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="md">Create Channel</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Agents Modal */}
      <Modal isOpen={showAgentsModal} onClose={() => setShowAgentsModal(false)} title={`Assign Agents to "${selectedChannel?.name}"`} subtitle="Select from available delivery partners">
        <div className="space-y-4 pt-2">
          {availableAgents.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 mb-1">No agents available</p>
              <p className="text-xs text-slate-400 mb-4">Add new delivery agents from the Delivery Agents page.</p>
              <Link to="/farmer/agents">
                <Button variant="primary" size="sm">Add New Agent</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableAgents.map((agent) => {
                const isSelected = selectedAgentIds.includes(agent._id);
                return (
                  <div
                    key={agent._id}
                    onClick={() => setSelectedAgentIds((prev) => isSelected ? prev.filter((id) => id !== agent._id) : [...prev, agent._id])}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition ${isSelected ? 'border-farm-600 bg-farm-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold text-xs">
                      {agent.fullName?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">{agent.fullName}</p>
                      <p className="text-[11px] text-slate-400">{agent.email} • {agent.mobile}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-farm-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
          {availableAgents.length > 0 && (
            <div className="pt-3 flex justify-between items-center">
              <span className="text-xs text-slate-500">{selectedAgentIds.length} agent(s) selected</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="md" onClick={() => setShowAgentsModal(false)}>Cancel</Button>
                <Button variant="primary" size="md" onClick={handleAssignAgents}>Assign Selected</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
