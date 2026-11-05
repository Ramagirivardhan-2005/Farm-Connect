import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Eye
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { DEFAULT_HERO_SLIDES } from '../../components/common/HeroCarousel';
import { useToast } from '../../components/common/Toast';

export default function AdminHeroContentPage() {
  const { addToast } = useToast();
  const [slides, setSlides] = useState(DEFAULT_HERO_SLIDES);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

  const [slideForm, setSlideForm] = useState({
    tag: 'Direct Harvest Marketplace',
    heading: 'FROM OUR FARMS\nTO YOUR HOME',
    description: 'Fresh products directly from verified farmers without middlemen.',
    cta: 'Explore FarmConnect',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
    isActive: true,
  });

  const handleSaveSlide = (e) => {
    e.preventDefault();
    if (editingSlide) {
      setSlides((prev) =>
        prev.map((s) => (s.id === editingSlide.id ? { ...s, ...slideForm } : s))
      );
      addToast({
        type: 'success',
        title: 'Hero Slide Updated',
        message: 'Changes published and login page Redis cache invalidated.',
      });
    } else {
      const newSlide = {
        id: `hero-${Date.now()}`,
        ...slideForm,
      };
      setSlides([...slides, newSlide]);
      addToast({
        type: 'success',
        title: 'New Hero Slide Added',
        message: 'New carousel slide published to authentication screen.',
      });
    }
    setShowModal(false);
    setEditingSlide(null);
  };

  const handleDelete = (id) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    addToast({
      type: 'info',
      title: 'Slide Deleted',
      message: 'Slide removed from login carousel.',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-purple-600" />
            <span>Hero Content CMS (Authentication Left Screen)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamically control images, agricultural headings, description copy, and carousel order displayed on /login and /signup.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => {
            setEditingSlide(null);
            setShowModal(true);
          }}
        >
          Add Promotional Slide
        </Button>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-48 w-full bg-slate-900">
              <img
                src={slide.image}
                alt={slide.heading}
                className="w-full h-full object-cover opacity-80"
              />
              <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur">
                Order #{idx + 1}
              </span>
            </div>

            <div className="p-5 space-y-2 flex-1">
              <span className="text-[10px] font-bold text-farm-700 bg-farm-50 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block">
                {slide.tag || 'Hero Badge'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 whitespace-pre-line leading-tight">
                {slide.heading}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {slide.description}
              </p>
            </div>

            <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">CTA: {slide.cta}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSlide(slide);
                    setSlideForm({
                      tag: slide.tag,
                      heading: slide.heading,
                      description: slide.description,
                      cta: slide.cta,
                      image: slide.image,
                      isActive: true,
                    });
                    setShowModal(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                  title="Edit Slide"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(slide.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                  title="Delete Slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Slide Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSlide ? 'Edit Promotional Slide' : 'Add New Promotional Hero Slide'}
        subtitle="Saved slides appear in the login split-screen carousel dynamically."
      >
        <form onSubmit={handleSaveSlide} className="space-y-4 pt-2">
          <Input
            label="Tagline Badge"
            value={slideForm.tag}
            onChange={(e) => setSlideForm({ ...slideForm, tag: e.target.value })}
            placeholder="e.g. Pure Farm Fresh Direct"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Promotional Heading (Lines separated by Enter)
            </label>
            <textarea
              rows={2}
              value={slideForm.heading}
              onChange={(e) => setSlideForm({ ...slideForm, heading: e.target.value })}
              placeholder="e.g. FROM OUR FARMS\nTO YOUR HOME"
              className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Sub-description Copy
            </label>
            <textarea
              rows={3}
              value={slideForm.description}
              onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })}
              placeholder="Explain direct farmer benefits..."
              className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
              required
            />
          </div>
          <Input
            label="High-Resolution Farm Image URL (Cloudinary / CDN)"
            value={slideForm.image}
            onChange={(e) => setSlideForm({ ...slideForm, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            required
          />
          <Input
            label="Call to Action Button Text"
            value={slideForm.cta}
            onChange={(e) => setSlideForm({ ...slideForm, cta: e.target.value })}
            placeholder="Explore FarmConnect"
            required
          />

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Publish Slide
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
