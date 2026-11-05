# Promotional Banners & Revenue Analytics

Routes: `/farmer/banners` and `/farmer/revenue`

## Promotional Banners (Instruction 62)
Farmers can create promotional campaign banners for festival harvests:
- Title, Campaign Description, Promotional Offer/Discount Code, Start Date, End Date, and High-Resolution Image.
- **Admin Approval Gate**: Banners enter `PENDING_APPROVAL` status until reviewed by Super Admin.
- Only approved, active, unexpired banners are displayed to subscribed customers.

## Direct Revenue Analytics (Instruction 63)
Financial metrics are computed strictly from verified backend database payment records:
- **Total Lifetime Revenue**
- **Today's Gross Sales**
- **Weekly & Monthly Revenue**
- **Settled Orders vs. Pending Escrow Payments**
- No financial figures are calculated or trusted from frontend state.
