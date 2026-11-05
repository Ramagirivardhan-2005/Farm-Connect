# Products & Stock Presentation

Route: `/item/:itemId`

## Product Presentation (Instruction 84)
Each farm product card displays:
- Real photograph of current farm stock (generic stock photos prohibited).
- Wishlist / Like button.
- Crop Name, Agricultural Category, Botanical Type.
- Quality Grade (e.g., Grade A+) and Farming Method (Organic, ZBNF, Hydroponic).
- Star rating and total verified direct purchases count.
- Price per Unit (₹/KG, Bundle, Dozen).
- Visual stock availability indicator.

## Visual Stock Presentation (Instruction 36)
Rather than raw database tables, inventory is displayed through clear visual progress cards:
- 🟢 Available Stock (e.g., `240 KG available`)
- Total Harvest Quantity (e.g., `400 KG total`)
- Dispatched / Sold Quantity (`160 KG sold`)
- Minimum Selling Unit & Minimum Order Quantity

## Recommendations (Instruction 40)
The bottom of each product detail page surfaces curated similar products derived from:
- Same crop category (e.g., Tomatoes $\rightarrow$ Bell Peppers, Onions, Potatoes).
- Same farmer channel.
- Customer purchase history.
