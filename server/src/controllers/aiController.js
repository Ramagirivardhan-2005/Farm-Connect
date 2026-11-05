import { generateProductAssistance } from '../services/geminiService.js';

/**
 * Gemini AI Assistance Endpoint (Instruction 34 & 95)
 * Sanitizes input and invokes Gemini backend layer safely.
 */
export async function productAssist(req, res, next) {
  try {
    const { name, farmingType, category } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required for Gemini AI assistance.',
      });
    }

    // Sanitize input against prompt injection
    const cleanName = name.trim().slice(0, 100);
    const cleanFarming = (farmingType || 'Organic').slice(0, 50);
    const cleanCategory = (category || 'Vegetables').slice(0, 50);

    const assistance = await generateProductAssistance({
      name: cleanName,
      farmingType: cleanFarming,
      category: cleanCategory,
    });

    return res.json({
      success: true,
      data: assistance,
    });
  } catch (err) {
    next(err);
  }
}

export default { productAssist };
