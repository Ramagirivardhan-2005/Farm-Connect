import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Home,
  Briefcase,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

const API_BASE = '/api';

export default function AddressesPage() {
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    house: '',
    street: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    landmark: '',
    type: 'Home',
  });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('farmconnect_token');
      const res = await fetch(`${API_BASE}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      } else {
        // Fallback for local preview if no server address yet
        const saved = localStorage.getItem('fc_addresses');
        if (saved) setAddresses(JSON.parse(saved));
      }
    } catch {
      const saved = localStorage.getItem('fc_addresses');
      if (saved) setAddresses(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      fullName: '',
      mobile: '',
      house: '',
      street: '',
      village: '',
      district: '',
      state: '',
      pincode: '',
      landmark: '',
      type: 'Home',
    });
    setShowModal(true);
  };

  const openEditModal = (addr) => {
    setEditingAddress(addr);
    setFormData({
      fullName: addr.fullName || '',
      mobile: addr.mobile || '',
      house: addr.house || '',
      street: addr.street || '',
      village: addr.village || '',
      district: addr.district || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      landmark: addr.landmark || '',
      type: addr.type || 'Home',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('farmconnect_token');

    try {
      if (editingAddress) {
        const res = await fetch(`${API_BASE}/addresses/${editingAddress._id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const data = await res.json();
          setAddresses((prev) =>
            prev.map((a) => (a._id === editingAddress._id ? data.address : a))
          );
          addToast({ type: 'success', title: 'Address Updated', message: 'Address updated successfully.' });
        } else {
          // Local fallback
          setAddresses((prev) =>
            prev.map((a) => (a._id === editingAddress._id ? { ...a, ...formData } : a))
          );
          addToast({ type: 'success', title: 'Address Updated', message: 'Address updated locally.' });
        }
      } else {
        const res = await fetch(`${API_BASE}/addresses`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const data = await res.json();
          setAddresses((prev) => [data.address, ...prev]);
          addToast({ type: 'success', title: 'Address Added', message: 'New address added to your profile.' });
        } else {
          const localAddr = {
            ...formData,
            _id: `addr-${Date.now()}`,
            isDefault: addresses.length === 0,
          };
          const updated = [localAddr, ...addresses];
          setAddresses(updated);
          localStorage.setItem('fc_addresses', JSON.stringify(updated));
          addToast({ type: 'success', title: 'Address Added', message: 'Address saved locally.' });
        }
      }
      setShowModal(false);
    } catch {
      const localAddr = {
        ...formData,
        _id: `addr-${Date.now()}`,
        isDefault: addresses.length === 0,
      };
      const updated = [localAddr, ...addresses];
      setAddresses(updated);
      localStorage.setItem('fc_addresses', JSON.stringify(updated));
      addToast({ type: 'success', title: 'Address Saved', message: 'Saved successfully.' });
      setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('farmconnect_token');
    try {
      await fetch(`${API_BASE}/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {}

    const updated = addresses.filter((a) => a._id !== id);
    setAddresses(updated);
    localStorage.setItem('fc_addresses', JSON.stringify(updated));
    addToast({ type: 'info', title: 'Address Removed', message: 'Address has been deleted.' });
  };

  const handleSetDefault = async (id) => {
    const token = localStorage.getItem('farmconnect_token');
    try {
      await fetch(`${API_BASE}/addresses/${id}/default`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {}

    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a._id === id,
    }));
    setAddresses(updated);
    localStorage.setItem('fc_addresses', JSON.stringify(updated));
    addToast({ type: 'success', title: 'Default Updated', message: 'Default delivery address changed.' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-farm-600" />
            <span>Delivery Addresses</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your doorstep drop locations for fresh farm produce deliveries.
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={openAddModal}>
          Add New Address
        </Button>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`bg-white rounded-3xl p-5 border-2 transition relative flex flex-col justify-between ${
              addr.isDefault
                ? 'border-farm-600 bg-farm-50/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{addr.fullName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                    {addr.type || 'Home'}
                  </span>
                </div>
                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Default
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {addr.house}, {addr.street}{addr.village ? `, ${addr.village}` : ''}, {addr.district}, {addr.state} - <strong>{addr.pincode}</strong>
              </p>

              {addr.landmark && (
                <p className="text-[11px] text-slate-400">
                  Landmark: {addr.landmark}
                </p>
              )}

              <p className="text-[11px] font-semibold text-slate-500 pt-1">
                Contact: {addr.mobile}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs font-bold text-farm-600 hover:text-farm-700"
                  >
                    Set as Default
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(addr)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  title="Edit address"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr._id)}
                  className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && !loading && (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 mb-2">No Saved Addresses</h3>
          <p className="text-xs text-slate-500 mb-4">Add your home or office address to receive farm harvests quickly.</p>
          <Button variant="primary" size="md" icon={Plus} onClick={openAddModal}>
            Add First Address
          </Button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
        subtitle="Produce will be delivered straight to this address"
      >
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Recipient Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Ramagiri Vardhan"
              required
            />
            <Input
              label="Mobile Number"
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="House / Flat / Survey No."
              value={formData.house}
              onChange={(e) => setFormData({ ...formData, house: e.target.value })}
              placeholder="e.g. Flat 402, Green Meadows"
              required
            />
            <Input
              label="Street / Colony / Area"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="e.g. Kothrud Hill View"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="City / District"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="e.g. Pune"
              required
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Maharashtra"
              required
            />
            <Input
              label="PIN Code"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              placeholder="e.g. 411038"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Landmark (Optional)"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="e.g. Near MIT Dome"
            />
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Address Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 font-semibold focus:outline-none focus:border-farm-600"
              >
                <option value="Home">Home</option>
                <option value="Work">Work / Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="md" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              {editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
