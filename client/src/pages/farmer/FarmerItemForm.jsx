import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Sparkles,
  DollarSign,
  Layers,
  Calendar,
  Award,
  Upload,
  Bot,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast } from '../../components/common/Toast';
import { aiApi } from '../../services/api';

export default function FarmerItemForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    type: 'Nightshades',
    farmingType: 'Organic',
    qualityGrade: 'A',
    price: '',
    discount: '',
    unit: 'KG',
    availableStock: '',
    totalStock: '',
    minOrder: '1',
    minSellingUnit: '1',
    harvestDate: 'Today, 6:00 AM',
    shelfLife: '6 Days',
    description: '',
    tasteProfile: '',
    cultivationMethod: '',
    soilType: 'Black cotton fertile loamy soil',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  });

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GEMINI AI ASSISTANCE LAYER (Instruction 34 & 95)
  const handleGeminiAssist = async () => {
    if (!formData.name.trim()) {
      addToast({
        type: 'warning',
        title: 'Product Name Required',
        message: 'Enter a vegetable/fruit name (e.g. "Organic Vine Tomato") for Gemini AI to assist.',
      });
      return;
    }

    setIsAiGenerating(true);
    addToast({
      type: 'info',
      title: 'Gemini AI Analyzing Produce',
      message: 'Generating culinary description, shelf life estimates, and taste profile suggestions...',
    });

    try {
      const suggestions = await aiApi.generateListing(formData.name, formData.category, formData.farmingType);
      setIsAiGenerating(false);

      if (suggestions) {
        setFormData((prev) => ({
          ...prev,
          description: suggestions.description || prev.description,
          tasteProfile: suggestions.nutritionalHighlights?.join('. ') || prev.tasteProfile,
          cultivationMethod: suggestions.bestUsedFor ? `Best used for: ${suggestions.bestUsedFor.join(', ')}` : prev.cultivationMethod,
          shelfLife: suggestions.storageInstructions || '5 to 7 Days (Store in cool, well-ventilated space)',
          price: suggestions.suggestedPrice?.min ? String(suggestions.suggestedPrice.min) : prev.price,
        }));

        addToast({
          type: 'success',
          title: 'Gemini AI Suggestions Applied',
          message: 'Product description, pricing corridor, and harvest shelf life enriched by Gemini AI.',
        });
      }
    } catch (err) {
      setIsAiGenerating(false);
      addToast({
        type: 'error',
        title: 'AI Generation Error',
        message: 'Could not contact Gemini AI assist.',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      addToast({
        type: 'success',
        title: 'Harvest Item Published!',
        message: `${formData.name} is now live and discoverable on your FarmConnect Channel.`,
      });
      navigate('/farmer/items');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-farm-600" />
            <span>List Fresh Farm Produce / Harvest</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Provide authentic harvest metrics and real farm photos. No generic stock photographs permitted.
          </p>
        </div>

        {/* Gemini AI Assist Button */}
        <Button
          variant="secondary"
          size="md"
          icon={Bot}
          loading={isAiGenerating}
          onClick={handleGeminiAssist}
          className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 self-start sm:self-auto font-bold shadow-xs"
        >
          Auto-Complete with Gemini AI
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information (Instruction 32) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            1. Basic Harvest Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Produce Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Farm Fresh Organic Vine Tomatoes"
              required
            />
            <Select
              label="Primary Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={['Vegetables', 'Fruits', 'Leafy Greens', 'Root Vegetables', 'Gourds', 'Nightshades', 'Exotics']}
              required
            />
            <Select
              label="Botanical Crop Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={['Leafy Greens', 'Root Vegetables', 'Gourds', 'Nightshades', 'Fruits', 'Other']}
              required
            />
            <Select
              label="Farming Practice"
              value={formData.farmingType}
              onChange={(e) => setFormData({ ...formData, farmingType: e.target.value })}
              options={['Organic', 'Natural / ZBNF', 'Hydroponic', 'Conventional']}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of produce, seed variety, and freshness guarantees..."
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
              required
            />
          </div>
        </div>

        {/* Section 2: Inventory & Pricing (Instruction 32 & 36) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            2. Inventory & Fair Farm Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price Per Unit (₹)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 60"
              required
            />
            <Select
              label="Unit of Measure"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={['KG', 'Bundle', 'Dozen', 'Piece', 'Gram', 'Box']}
              required
            />
            <Input
              label="Available Current Stock"
              type="number"
              value={formData.availableStock}
              onChange={(e) => setFormData({ ...formData, availableStock: e.target.value })}
              placeholder="e.g. 240"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Minimum Order Quantity"
              type="number"
              value={formData.minOrder}
              onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
              placeholder="e.g. 1"
              required
            />
            <Input
              label="Minimum Selling Increment"
              type="number"
              step="0.1"
              value={formData.minSellingUnit}
              onChange={(e) => setFormData({ ...formData, minSellingUnit: e.target.value })}
              placeholder="e.g. 0.5 or 1"
              required
            />
          </div>
        </div>

        {/* Section 3: Harvest, Quality & Taste */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            3. Harvest Date, Shelf Life & Quality
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Harvest Timing"
              value={formData.harvestDate}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              placeholder="e.g. Today, 6:00 AM"
              required
            />
            <Input
              label="Estimated Shelf Life"
              value={formData.shelfLife}
              onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
              placeholder="e.g. 6 Days"
              required
            />
            <Select
              label="Quality Grade"
              value={formData.qualityGrade}
              onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
              options={['A+', 'A', 'B+', 'Export Quality']}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Taste Profile & Aroma"
              value={formData.tasteProfile}
              onChange={(e) => setFormData({ ...formData, tasteProfile: e.target.value })}
              placeholder="e.g. Sweet umami with pleasant morning freshness"
            />
            <Input
              label="Cultivation & Soil Highlights"
              value={formData.cultivationMethod}
              onChange={(e) => setFormData({ ...formData, cultivationMethod: e.target.value })}
              placeholder="e.g. Jeevamrutha natural microbial nourishment"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" size="lg" onClick={() => navigate('/farmer/items')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
            Publish Produce to Channel
          </Button>
        </div>
      </form>
    </div>
  );
}
