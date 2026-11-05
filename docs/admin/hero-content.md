# Hero Content CMS (Authentication Left Screen)

Route: `/admin/hero-content`

## Promotional Carousel Management (Instruction 5 & 67)
Super Admins dynamically control the left side of the split-screen authentication experience (`/login` and `/signup`):
- **Slide Fields**: Promotional Tagline, Large Headline, Detailed Sub-description Copy, High-Resolution Farm Image URL, Call-to-Action (CTA) Button Text, Display Order, and Active Status.
- **Dynamic Carousel Logic**:
  - If multiple slides are active, renders an auto-advancing crossfade carousel with slide indicators.
  - If only a single slide exists, renders the single image cleanly without unnecessary carousel controls (Instruction 5).
- **Redis Cache Invalidation**:
  - Hero slides are cached in Redis under key `cms:hero_slides` (1-hour TTL).
  - Whenever an admin adds, edits, or deletes a slide, the cache key is purged immediately to ensure real-time consistency.
