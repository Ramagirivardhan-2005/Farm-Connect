# Farmer Channels Discovery & Smart Ranking

Route: `/customer/channels` and `/channel/:channelId`

## Channel Discovery
FarmConnect displays farmer channels in rich card layouts rather than boring database tables (Instruction 15).

### Card Data Fields
- Channel Banner Cover Image
- Farmer Profile Avatar with Verified Badge
- Channel Name & Farmer Legal Name
- Farm Location (Tehsil, District, State)
- Aggregate Rating (1.0 to 5.0★) & Review Count
- Total Channel Subscribers
- Featured Produce Tags
- One-click Subscribe & Pin controls

## Smart Ranking Algorithm (Instruction 16)
To avoid unfair bias where a channel with one 5-star review outranks an established channel with thousands of verified positive reviews, FarmConnect applies a Bayesian-weighted quality scoring algorithm:

$$\text{Score} = \text{Rating} \times \log_{10}(\text{ReviewCount} + 1)$$

Configurable ranking weights also evaluate:
1. Verified Agricultural Certifications (NPOP, Jaivik Bharat, FSSAI)
2. Harvest Availability & Active Products Count
3. Distance & Delivery Proximity to Customer
4. Recent Harvest Activity & Dispatch Rate

## Individual Channel Page (`/channel/:channelId`)
- Large channel banner & farmer biography.
- External links to website, Instagram, and YouTube (Instruction 22).
- Tabbed interface:
  - **Farm Products**: Grid of currently available fresh harvests.
  - **About Farmer & Certifications**: Land area, years of experience, APEDA/NPOP license numbers, and state honors.
  - **Comments & Community**: Customer reviews with farmer replies and moderation.
