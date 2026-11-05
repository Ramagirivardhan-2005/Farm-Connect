# Gemini AI Integration

FarmConnect integrates Google's Gemini AI to help farmers write high-quality product listings. This document covers the integration architecture, the strict server-side-only policy, and the heuristic fallback system.

---

## 1. What Gemini Is Used For

Farmers often struggle to write compelling product descriptions. The **AI Assist** button on the `FarmerItemForm` sends a product name and category to the server, which returns:

- A professional product description
- Suggested price range (min/max per unit)
- Nutritional highlights
- Best uses for the product
- Storage instructions
- Relevant tags (organic, seasonal, GI-tagged, etc.)

This is the **only** feature powered by Gemini in v1.

---

## 2. Architecture — Server-Side Only

```
[FarmerItemForm (React)]
       |
       | POST /api/v1/ai/product-assist
       | { productName, category, additionalContext }
       |
[aiController.js]
       |
       | Input sanitization (strip HTML, truncate to 500 chars)
       |
[geminiService.js]
       |
       | If GEMINI_API_KEY configured → Gemini API
       | If not configured            → Heuristic fallback
       |
[Response back to farmer UI]
```

**The Gemini API key is never exposed to the browser.** All AI calls pass through the Express server. The client only knows `/api/v1/ai/product-assist` — it never calls Google directly.

---

## 3. Implementation — `src/services/geminiService.js`

```js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function getProductSuggestions({ productName, category, additionalContext }) {
  if (genAI) {
    return await callGeminiAPI(productName, category, additionalContext);
  }
  return getHeuristicSuggestions(productName, category);
}
```

### Gemini API Call

```js
async function callGeminiAPI(productName, category, additionalContext) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    You are an agricultural product listing assistant for FarmConnect, an Indian farmer marketplace.
    
    Generate a structured product listing for:
    Product: ${productName}
    Category: ${category}
    Additional context: ${additionalContext || 'None'}
    
    Respond with a JSON object containing:
    - description (string, 2-3 sentences, compelling and honest)
    - suggestedPrice (object: { min, max, unit })
    - nutritionalHighlights (array of strings, max 4)
    - bestUsedFor (array of strings, max 4)
    - storageInstructions (string)
    - tags (array of strings, max 6)
    
    Important rules:
    - Do NOT invent specific certifications the farmer did not mention
    - Do NOT guarantee specific quantities or stock levels
    - Prices should be realistic for the Indian market in INR
    - Keep descriptions honest and grounded
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}
```

### Safety Rules Enforced by Prompt

The prompt explicitly instructs Gemini to:
1. **Never invent certifications** the farmer did not mention.
2. **Never state stock quantities** — only the farmer knows their inventory.
3. **Never state guarantees** about quality that cannot be verified.
4. Keep prices realistic for the **Indian market in INR**.

---

## 4. Heuristic Fallback

If `GEMINI_API_KEY` is not set (local development, API quota exceeded, or API unavailable), `geminiService.js` returns high-quality category-based heuristics:

```js
const CATEGORY_HEURISTICS = {
  Fruits: {
    nutritionalHighlights: ['Rich in Vitamin C', 'Natural antioxidants', 'High fiber content'],
    tags: ['fresh', 'seasonal', 'farm-direct'],
    storageInstructions: 'Store at room temperature until ripe. Refrigerate after ripening.',
  },
  Vegetables: {
    nutritionalHighlights: ['High in dietary fiber', 'Rich in minerals', 'Low calorie'],
    tags: ['fresh', 'farm-to-table', 'no-preservatives'],
    storageInstructions: 'Refrigerate in the crisper drawer. Best consumed within 3-5 days.',
  },
  // ... all categories
};
```

The farmer gets useful suggestions even without a Gemini API key configured. This ensures the feature is always functional during development and demos.

---

## 5. Input Controller — Sanitization

```js
// src/controllers/aiController.js
export const productAssist = async (req, res, next) => {
  try {
    const { productName, category, additionalContext } = req.body;

    // Sanitize: strip HTML, truncate to prevent prompt injection
    const safeName = productName.replace(/<[^>]*>/g, '').substring(0, 100);
    const safeContext = (additionalContext || '').replace(/<[^>]*>/g, '').substring(0, 500);

    const suggestions = await getProductSuggestions({
      productName: safeName,
      category,
      additionalContext: safeContext,
    });

    res.json({ success: true, suggestions });
  } catch (err) {
    next(err);
  }
};
```

---

## 6. Rate Limiting

The AI endpoint is rate-limited to prevent abuse and control API costs:

```
POST /api/v1/ai/product-assist
Rate limit: 20 requests / 60 minutes per IP
```

This limits each farmer to approximately 20 AI assists per hour, which is more than sufficient for normal product listing workflows.

---

## 7. Configuration

```env
# .env
GEMINI_API_KEY=your-gemini-api-key-here
```

If this variable is absent or empty, the server silently falls back to heuristics — no error is thrown.

---

## 8. What Gemini Never Does

| Prohibited | Reason |
|---|---|
| Set or change product prices | Price authority belongs to the farmer |
| Update inventory quantities | Inventory is managed exclusively through the Inventory model |
| Access PII or order data | The AI controller receives only product name + category |
| Call external URLs | The prompt is self-contained — no web browsing |
| Run client-side | The Gemini API key must never reach the browser |

---

## 9. Future AI Features (Roadmap)

| Feature | Description |
|---|---|
| Demand forecasting | Predict seasonal demand based on historical order patterns |
| Price optimization | Suggest dynamic pricing based on market data |
| Customer chat assistant | Answer product questions using channel data |
| Harvest planning | Suggest planting schedules based on demand forecasts |
| Fraud detection | Flag suspicious order patterns using anomaly detection |
