# Cloudinary & Media Management Policy

FarmConnect delegates all media asset storage, image transformation, and responsive delivery to Cloudinary. This document describes media workflows, asset transformations, resolution standards, and production upload practices.

---

## 1. Asset Categories & Dimensions

To maintain high visual fidelity across the marketplace while keeping page load times minimal, all media uploaded by farmers and admins must conform to standard aspect ratios and dimensions:

| Asset Category | Aspect Ratio | Target Dimensions | Max File Size | Format |
|---|---|---|---|---|
| **Channel Avatar** | 1:1 (Square) | 400 × 400 px | 2 MB | WebP / JPEG / PNG |
| **Channel Cover Banner**| 3:1 (Panoramic) | 1200 × 400 px | 5 MB | WebP / JPEG |
| **Product Showcase** | 4:3 or 1:1 | 800 × 600 px or 800 × 800 px | 4 MB | WebP / JPEG |
| **Hero Carousel Slide**| 16:9 | 1920 × 1080 px | 8 MB | WebP / JPEG |
| **Farmer Verification** | Original Document | Clear document scan (PDF/PNG) | 10 MB | PDF / PNG / JPEG |

---

## 2. Cloudinary Dynamic URL Transformations

FarmConnect leverages Cloudinary's dynamic URL manipulation to optimize bandwidth and enforce correct crop framing on the edge:

### Example Avatar Transformation
```
https://res.cloudinary.com/farmconnect/image/upload/w_400,h_400,c_fill,g_face,q_auto,f_auto/v1/channels/avatars/green_valley.jpg
```
- `w_400,h_400`: Dimensions clamped to 400×400 px.
- `c_fill`: Smart cropping to fill dimensions without stretching.
- `g_face`: Focus on human faces when cropping farmer profile pictures.
- `q_auto`: Automated perceptual quality compression.
- `f_auto`: Delivers WebP or AVIF automatically depending on client browser support.

### Example Product Gallery Thumbnail
```
https://res.cloudinary.com/farmconnect/image/upload/w_500,h_500,c_pad,b_white,q_auto,f_auto/v1/products/mangoes.jpg
```
- `c_pad,b_white`: Centers rectangular harvest photos in a square with clean white padding.

---

## 3. Storage Namespaces (Folders)

All uploaded assets in Cloudinary are organized into structured directories:

```
farmconnect/
├── channels/
│   ├── avatars/
│   └── banners/
├── products/
│   ├── items/
│   └── certificates/
├── hero/
│   └── cms_slides/
└── verification_docs/       <-- Restricted access / Private
```

---

## 4. Secure Direct Upload Pattern (Client-to-Cloudinary)

To offload server bandwidth and prevent large multi-megabyte payloads from tying up Express worker threads, uploads use pre-signed upload presets:

```
[Browser / Client]
       │
       ├─ 1. Request signed signature ─► [FarmConnect Server /api/v1/media/sign]
       │                                     │
       │◄─ 2. Returns signature + timestamp ─┘
       │
       ├─ 3. Upload file directly ────► [Cloudinary Edge CDN]
       │                                     │
       │◄─ 4. Returns secure URL + metadata ─┘
       │
       └─ 5. Save URL to Mongo record ─► [FarmConnect Server /api/v1/channels]
```

### Server-Side Signature Endpoint (Standard Pattern)
```javascript
import { v2 as cloudinary } from 'cloudinary';

export const getUploadSignature = (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: req.query.folder || 'farmconnect/products',
    },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
};
```

---

## 5. Fallback & Default Placeholders

For local offline development and initial mockup states, FarmConnect includes high-resolution, uncompressed static royalty-free Unsplash agriculture assets configured in `src/services/mockData.js`. If Cloudinary credentials are not configured in `.env`, the client automatically utilizes fallback placeholders without broken image states.
