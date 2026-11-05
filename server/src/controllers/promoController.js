import PromoCode from '../models/PromoCode.js';

export async function validatePromo(req, res, next) {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Promo code is required.' });

    const promo = await PromoCode.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!promo) return res.status(404).json({ success: false, message: 'Invalid or expired promo code.' });

    const now = new Date();
    if (promo.validUntil && now > promo.validUntil) {
      return res.status(400).json({ success: false, message: 'This promo code has expired.' });
    }
    if (promo.validFrom && now < promo.validFrom) {
      return res.status(400).json({ success: false, message: 'This promo code is not yet active.' });
    }
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit.' });
    }
    if (promo.minOrderValue && orderAmount < promo.minOrderValue) {
      return res.status(400).json({ success: false, message: `Minimum order of ₹${promo.minOrderValue} required.` });
    }
    const userId = req.user.id;
    if (promo.usedByUsers.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already used this promo code.' });
    }

    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = (orderAmount * promo.discountValue) / 100;
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else {
      discount = promo.discountValue;
    }
    discount = Math.min(discount, orderAmount);

    return res.json({
      success: true,
      discount: Math.round(discount),
      promoCode: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPromos(req, res, next) {
  try {
    const promos = await PromoCode.find({ isActive: true, $or: [{ validUntil: null }, { validUntil: { $gt: new Date() } }] }).select('-usedByUsers').limit(20);
    return res.json({ success: true, promos });
  } catch (err) {
    next(err);
  }
}
