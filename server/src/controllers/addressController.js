import Address from '../models/Address.js';

export async function getAddresses(req, res, next) {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    return res.json({ success: true, addresses });
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req, res, next) {
  try {
    const { fullName, mobile, house, street, village, district, state, pincode, landmark, type } = req.body;
    if (!fullName || !mobile || !house || !district || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'Required address fields missing.' });
    }

    // If this is the first address, make it default
    const count = await Address.countDocuments({ userId: req.user.id });
    const isDefault = count === 0 ? true : false;

    const address = await Address.create({
      userId: req.user.id,
      fullName, mobile, house, street, village, district, state, pincode, landmark,
      type: type || 'Home',
      isDefault,
    });
    return res.status(201).json({ success: true, address });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    return res.json({ success: true, address });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    return res.json({ success: true, message: 'Address deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function setDefaultAddress(req, res, next) {
  try {
    await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isDefault: true },
      { new: true }
    );
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    return res.json({ success: true, address });
  } catch (err) {
    next(err);
  }
}
