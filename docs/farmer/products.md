# Farmer Product Management & Gemini AI Assistance

Route: `/farmer/items` and `/farmer/items/new`

## Product Listing Fields (Instruction 32)
1. **Basic**: Crop Name, Agricultural Category, Botanical Type, Detailed Description.
2. **Farming Type**: Organic, Natural / ZBNF, Hydroponic, Conventional.
3. **Inventory**: Available Stock, Total Stock, Sold Stock, Unit of Measure (KG, Bundle, Dozen), Minimum Selling Unit, Minimum Order Quantity.
4. **Pricing**: Price Per Unit (₹), Discount Percentage, Offer Price.
5. **Harvest Timing**: Morning Harvest Timing, Status, Estimated Shelf Life.
6. **Quality**: Quality Grade (Grade A+, Grade A, Export), Uniformity Size.
7. **Cultivation**: Soil Type, Irrigation Source, Natural Composting Method.
8. **Taste & Aroma**: Sensory Taste Profile and Ripeness Index.

## Gemini AI Assistance Layer (Instruction 34 & 95)
Farmers can tap the **"Auto-Complete with Gemini AI"** button on the product form:
- Gemini generates compelling, SEO-optimized descriptions.
- Suggests botanical classifications and taste profiles based on crop variety.
- Evaluates estimated shelf life and storage conditions.
- **Strict Invariant**: Gemini runs solely on the backend (`POST /api/v1/ai/product-assist`) and is never permitted to fabricate authoritative values such as stock, price, farmer PII, or order states.
