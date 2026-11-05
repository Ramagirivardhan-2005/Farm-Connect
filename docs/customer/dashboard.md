# Customer Dashboard

Route: `/customer/dashboard`

The Customer Dashboard serves as the central discovery and harvest monitoring hub.

## Layout & Components
- **Top Brand Header**:
  - Global Search across produce, farmers, channels, and crop categories.
  - Interactive Notifications dropdown with live Socket.IO alerts.
  - Multi-farm Cart drawer shortcut.
  - Secure Purse quick balance badge.
  - Profile menu & instantaneous role preview switcher.
- **Collapsible Sidebar**:
  - Direct navigation across Customer and Farm Channel operations.
- **Subscribed Channel Promotional Banners**:
  - Strict Rule (Instruction 21): Displays only approved, active, and unexpired promotional banners published by channels the customer has subscribed to. If no valid banners exist, the banner section is completely hidden from view.
- **Top Farmer Channels Cards**:
  - Channels ranked via the Bayesian Ranking Algorithm.
  - Pinned channels always appear first.
  - Displays farmer avatar, verified badge, location, subscriber count, and star rating.
- **Today's Fresh Farm Harvests**:
  - Product cards with quick category filters (Vegetables, Fruits, Leafy Greens, Root Vegetables, Nightshades).
