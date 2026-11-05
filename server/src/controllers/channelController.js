import Channel from '../models/Channel.js';
import FarmerProfile from '../models/FarmerProfile.js';
import User from '../models/User.js';
import { encryptSensitive } from '../utils/crypto.js';

export async function getChannels(req, res, next) {
  try {
    const { category, location, minRating, search } = req.query;

    const query = { status: 'ACTIVE' }; // Suspended/deactivated channels are hidden (Instruction 28 & 65)

    if (location) {
      query.$or = [
        { location: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
        { district: { $regex: location, $options: 'i' } },
      ];
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { farmerName: { $regex: search, $options: 'i' } },
        { featuredProducts: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const channels = await Channel.find(query);

    // Smart Ranking Algorithm (Instruction 16):
    // Rating weighted by log10 of reviews to prevent 1-review 5-star channels from dominating
    const ranked = [...channels].sort((a, b) => {
      const aScore = (a.rating || 4.5) * Math.log10((a.reviewsCount || 10) + 1);
      const bScore = (b.rating || 4.5) * Math.log10((b.reviewsCount || 10) + 1);
      return bScore - aScore;
    });

    return res.json({
      success: true,
      count: ranked.length,
      data: ranked,
    });
  } catch (err) {
    next(err);
  }
}

export async function getChannelById(req, res, next) {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findOne({
      $or: [{ channelId }, { _id: channelId.match(/^[0-9a-fA-F]{24}$/) ? channelId : null }],
    }).populate('farmerId', '-aadhaarEncrypted -bankDetailsEncrypted'); // Never expose sensitive PII (Instruction 23)

    if (!channel) {
      return res.status(404).json({ success: false, message: 'Farmer channel not found.' });
    }

    return res.json({ success: true, data: channel });
  } catch (err) {
    next(err);
  }
}

export async function createChannel(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      farmerName,
      contact,
      farmLocation,
      aadhaarNumber,
      channelName,
      channelBio,
      description,
      bankAccountHolder,
      bankName,
      accountNumber,
      ifscCode,
      certName,
      certIssuer,
      certNumber,
    } = req.body;

    // Generate unique channel ID: FC-CH-0000XXXX (Instruction 26)
    const channelId = `FC-CH-0000${Math.floor(1000 + Math.random() * 9000)}`;

    // Create FarmerProfile with encrypted PII (Instruction 13 & 27)
    const farmerProfile = await FarmerProfile.create({
      userId,
      fullName: farmerName,
      contactNumber: contact,
      farmLocation,
      aadhaarEncrypted: encryptSensitive(aadhaarNumber),
      bankDetailsEncrypted: {
        accountHolder: bankAccountHolder,
        bankName,
        accountNumberEncrypted: encryptSensitive(accountNumber),
        ifscCode,
      },
      certifications: certName
        ? [{ name: certName, issuedBy: certIssuer, certificateNumber: certNumber }]
        : [],
    });

    const channel = await Channel.create({
      channelId,
      farmerId: farmerProfile._id,
      userId,
      name: channelName || `${farmerName}'s Farm Channel`,
      farmerName,
      location: farmLocation,
      bio: channelBio,
      description,
      status: 'PENDING_VERIFICATION', // Instruction 28
      bannerImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      profileImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
    });

    // Update User role to FARMER (Instruction 3: same user account)
    await User.findByIdAndUpdate(userId, {
      role: 'FARMER',
      farmerProfileId: farmerProfile._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Channel application created and submitted for verification.',
      data: channel,
    });
  } catch (err) {
    next(err);
  }
}

export default { getChannels, getChannelById, createChannel };
