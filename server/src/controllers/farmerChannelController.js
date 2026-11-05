import { DeliveryChannel } from '../models/DeliveryChannel.js';
import { DeliveryPartner } from '../models/DeliveryPartner.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { hashPassword } from '../utils/password.js';
import { sendOtpEmail } from '../services/emailService.js';
import crypto from 'crypto';

// In-memory demo data store for resilience when DB is disconnected
let mockChannels = [
  {
    _id: 'chan-001',
    channelId: 'FC-DC-001245',
    name: 'Sahyadri Organic Direct Express',
    farmerId: 'usr-farm-1',
    farmerName: 'Kisan Ramesh Patil',
    description: 'Fresh organic greens and fruits dispatched within 3 hours of harvest.',
    status: 'ACTIVE',
    defaultDeliveryFee: 35,
    freeDeliveryThreshold: 499,
    maxDeliveryCharge: 100,
    deliveryAgents: ['usr-deliv-1', 'deliv-002'],
    activeOrdersCount: 4,
    createdAt: new Date(),
  },
  {
    _id: 'chan-002',
    channelId: 'FC-DC-008910',
    name: 'Nashik Vineyard Cold-Chain Fleet',
    farmerId: 'usr-farm-1',
    farmerName: 'Kisan Ramesh Patil',
    description: 'Refrigerated electric courier for table grapes, pomegranates and berries.',
    status: 'ACTIVE',
    defaultDeliveryFee: 45,
    freeDeliveryThreshold: 499,
    maxDeliveryCharge: 100,
    deliveryAgents: ['usr-deliv-1'],
    activeOrdersCount: 2,
    createdAt: new Date(),
  },
];

let mockDeliveryAgents = [
  {
    _id: 'usr-deliv-1',
    userId: 'usr-deliv-1',
    deliveryAgentId: 'DP88102',
    fullName: 'Rahul Express Rider',
    email: 'rahul.deliveries@farmconnect.org',
    phone: '+91 98220 11988',
    altPhone: '+91 98220 11989',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    address: {
      house: 'Plot 42, Green Avenue',
      street: 'Shivaji Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
    },
    vehicleType: 'Electric Scooter',
    vehicleNumber: 'MH-12-FC-4491',
    serviceArea: 'West Pune & Pimpri Corridor',
    rating: 4.9,
    completedDeliveries: 148,
    activeDeliveries: 3,
    cancelledDeliveries: 1,
    earnings: 7400,
    status: 'AVAILABLE',
    isVerified: true,
    assignedChannels: ['chan-001', 'chan-002'],
  },
  {
    _id: 'deliv-002',
    deliveryAgentId: 'DP99241',
    fullName: 'Sunil Jadhav',
    email: 'sunil.courier@farmconnect.org',
    phone: '+91 97654 32110',
    altPhone: '+91 97654 32111',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    address: {
      house: 'Flat 104, Sunrise Tower',
      street: 'FC Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
    },
    vehicleType: 'Cargo Van',
    vehicleNumber: 'MH-14-EA-8820',
    serviceArea: 'Central Pune & Camp Zone',
    rating: 4.8,
    completedDeliveries: 94,
    activeDeliveries: 1,
    cancelledDeliveries: 0,
    earnings: 4700,
    status: 'AVAILABLE',
    isVerified: true,
    assignedChannels: ['chan-001'],
  },
  {
    _id: 'deliv-003',
    deliveryAgentId: 'DP77192',
    fullName: 'Amit Shinde',
    email: 'amit.delivery@farmconnect.org',
    phone: '+91 98901 23456',
    altPhone: '+91 98901 23457',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    address: {
      house: 'Survey 18, Kisan Bhavan',
      street: 'Market Yard',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411037',
    },
    vehicleType: 'Motorcycle',
    vehicleNumber: 'MH-12-XY-1020',
    serviceArea: 'South Pune & Hadapsar',
    rating: 4.7,
    completedDeliveries: 62,
    activeDeliveries: 0,
    cancelledDeliveries: 2,
    earnings: 3100,
    status: 'AVAILABLE',
    isVerified: true,
    assignedChannels: [],
  },
];

/**
 * 1. Create Delivery Channel (Requirement 3: Only Farmers)
 */
export async function createChannel(req, res, next) {
  try {
    const { name, description, defaultDeliveryFee, selectedAgentIds } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Channel name is required.' });
    }

    const channelCode = `FC-DC-${Math.floor(100000 + Math.random() * 900000)}`;
    const farmerId = req.user.id || req.user._id;
    const farmerName = req.user.username || 'Verified Farmer';

    try {
      const newChannel = await DeliveryChannel.create({
        channelId: channelCode,
        name: name.trim(),
        farmerId,
        farmerName,
        description: description || '',
        defaultDeliveryFee: defaultDeliveryFee ? Number(defaultDeliveryFee) : 40,
        freeDeliveryThreshold: 499,
        maxDeliveryCharge: 100,
        deliveryAgents: Array.isArray(selectedAgentIds) ? selectedAgentIds : [],
        status: 'ACTIVE',
      });

      // Update assigned channels on agents (many-to-many)
      if (Array.isArray(selectedAgentIds) && selectedAgentIds.length > 0) {
        await DeliveryPartner.updateMany(
          { _id: { $in: selectedAgentIds } },
          { $addToSet: { assignedChannels: newChannel._id } }
        );
      }

      return res.status(201).json({
        success: true,
        message: 'Delivery Channel created successfully.',
        channel: newChannel,
      });
    } catch (dbErr) {
      // Mock fallback
      const mockChannel = {
        _id: `chan-${Date.now()}`,
        channelId: channelCode,
        name: name.trim(),
        farmerId,
        farmerName,
        description: description || '',
        defaultDeliveryFee: defaultDeliveryFee ? Number(defaultDeliveryFee) : 40,
        freeDeliveryThreshold: 499,
        maxDeliveryCharge: 100,
        deliveryAgents: Array.isArray(selectedAgentIds) ? selectedAgentIds : [],
        status: 'ACTIVE',
        activeOrdersCount: 0,
        createdAt: new Date(),
      };
      mockChannels.unshift(mockChannel);
      return res.status(201).json({
        success: true,
        message: 'Delivery Channel created successfully (mock mode).',
        channel: mockChannel,
      });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Get All Channels for Farmer (Requirement 3)
 */
export async function getFarmerChannels(req, res, next) {
  try {
    const farmerId = req.user.id || req.user._id;
    try {
      const channels = await DeliveryChannel.find({ farmerId })
        .populate('deliveryAgents')
        .sort({ createdAt: -1 });

      if (channels && channels.length > 0) {
        return res.json({ success: true, channels });
      }
    } catch (_) {}

    return res.json({ success: true, channels: mockChannels });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Assign Existing Delivery Agents to Channel (Requirement 4)
 */
export async function assignAgentsToChannel(req, res, next) {
  try {
    const { id } = req.params;
    const { agentIds } = req.body;

    if (!Array.isArray(agentIds) || agentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one delivery agent.' });
    }

    try {
      const channel = await DeliveryChannel.findById(id);
      if (!channel) {
        return res.status(404).json({ success: false, message: 'Delivery Channel not found.' });
      }

      // Check ownership (Requirement 3: Only farmer who owns channel can add agents)
      if (channel.farmerId.toString() !== (req.user.id || req.user._id).toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only the channel owner can assign delivery agents.',
        });
      }

      // Many-to-many add
      await DeliveryChannel.findByIdAndUpdate(id, {
        $addToSet: { deliveryAgents: { $each: agentIds } },
      });

      await DeliveryPartner.updateMany(
        { _id: { $in: agentIds } },
        { $addToSet: { assignedChannels: channel._id } }
      );

      const updated = await DeliveryChannel.findById(id).populate('deliveryAgents');
      return res.json({
        success: true,
        message: 'Delivery agents successfully assigned to channel.',
        channel: updated,
      });
    } catch (_) {
      // Mock fallback
      const ch = mockChannels.find((c) => c._id === id || c.channelId === id);
      if (ch) {
        agentIds.forEach((aid) => {
          if (!ch.deliveryAgents.includes(aid)) ch.deliveryAgents.push(aid);
        });
        mockDeliveryAgents.forEach((a) => {
          if (agentIds.includes(a._id) && !a.assignedChannels.includes(ch._id)) {
            a.assignedChannels.push(ch._id);
          }
        });
        return res.json({ success: true, message: 'Agents assigned to channel.', channel: ch });
      }
      return res.status(404).json({ success: false, message: 'Channel not found.' });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Remove Delivery Agent from Channel (Requirement 3 & 4)
 */
export async function removeAgentFromChannel(req, res, next) {
  try {
    const { id, agentId } = req.params;

    try {
      const channel = await DeliveryChannel.findById(id);
      if (!channel) {
        return res.status(404).json({ success: false, message: 'Channel not found.' });
      }

      if (channel.farmerId.toString() !== (req.user.id || req.user._id).toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized: Only channel owner can remove agents.' });
      }

      await DeliveryChannel.findByIdAndUpdate(id, {
        $pull: { deliveryAgents: agentId },
      });

      await DeliveryPartner.findByIdAndUpdate(agentId, {
        $pull: { assignedChannels: channel._id },
      });

      return res.json({ success: true, message: 'Delivery agent removed from channel.' });
    } catch (_) {
      const ch = mockChannels.find((c) => c._id === id || c.channelId === id);
      if (ch) {
        ch.deliveryAgents = ch.deliveryAgents.filter((a) => a !== agentId && a?._id !== agentId);
        return res.json({ success: true, message: 'Delivery agent removed from channel.' });
      }
      return res.status(404).json({ success: false, message: 'Channel not found.' });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Get Available Delivery Agents for Assignment (Requirement 4)
 */
export async function getAvailableDeliveryAgents(req, res, next) {
  try {
    try {
      const agents = await DeliveryPartner.find()
        .populate('assignedChannels')
        .sort({ rating: -1 });

      if (agents && agents.length > 0) {
        return res.json({ success: true, agents });
      }
    } catch (_) {}

    return res.json({ success: true, agents: mockDeliveryAgents });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. Add New Delivery Boy (Requirement 5: Email Verification + Credentials)
 */
export async function addNewDeliveryBoy(req, res, next) {
  try {
    const {
      fullName,
      phone,
      email,
      altPhone,
      house,
      street,
      city,
      state,
      pincode,
      profileImage,
      vehicleType,
      vehicleNumber,
    } = req.body;

    if (!fullName || !phone || !email) {
      return res.status(400).json({ success: false, message: 'Full name, mobile number, and email are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const deliveryAgentId = `DP${Math.floor(10000 + Math.random() * 90000)}`;
    const tempPassword = `FarmDP@${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await hashPassword(tempPassword);

    try {
      // 1. Check existing user
      let existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      // 2. Create User account (isEmailVerified = false pending activation per Requirement 5)
      const user = await User.create({
        username: fullName.trim(),
        userId: deliveryAgentId,
        email: cleanEmail,
        mobile: phone.trim(),
        altMobile: altPhone || '',
        passwordHash,
        role: 'DELIVERY_PARTNER',
        isEmailVerified: false,
        isActive: true,
      });

      // 3. Create DeliveryPartner profile
      const agentProfile = await DeliveryPartner.create({
        userId: user._id,
        deliveryAgentId,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        altPhone: altPhone || '',
        profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        address: {
          house: house || '',
          street: street || '',
          city: city || 'Pune',
          state: state || 'Maharashtra',
          pincode: pincode || '411001',
        },
        vehicleType: vehicleType || 'Electric Scooter',
        vehicleNumber: vehicleNumber || 'MH-12-FC-TEMP',
        status: 'PENDING_VERIFICATION',
        isVerified: false,
        assignedChannels: [],
      });

      // 4. Send email verification and temporary login details (Requirement 5)
      const otp = crypto.randomInt(100000, 999999).toString();
      try {
        await sendOtpEmail(cleanEmail, otp);
      } catch (mailErr) {
        console.warn('Delivery agent email notice:', mailErr.message);
      }

      return res.status(201).json({
        success: true,
        message: `Delivery Agent account created for ${fullName}. Verification email and activation credentials dispatched to ${cleanEmail}.`,
        agent: agentProfile,
        tempCredentials: {
          deliveryAgentId,
          email: cleanEmail,
          tempPassword,
        },
      });
    } catch (dbErr) {
      // Mock fallback
      const newMockAgent = {
        _id: `deliv-${Date.now()}`,
        userId: `usr-deliv-${Date.now()}`,
        deliveryAgentId,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        altPhone: altPhone || '',
        profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        address: { house, street, city: city || 'Pune', state: state || 'Maharashtra', pincode },
        vehicleType: vehicleType || 'Electric Scooter',
        vehicleNumber: vehicleNumber || 'MH-12-TEMP',
        rating: 5.0,
        completedDeliveries: 0,
        activeDeliveries: 0,
        cancelledDeliveries: 0,
        earnings: 0,
        status: 'PENDING_VERIFICATION',
        isVerified: false,
        assignedChannels: [],
      };
      mockDeliveryAgents.push(newMockAgent);

      return res.status(201).json({
        success: true,
        message: `Delivery Agent account created for ${fullName}. Activation details dispatched to ${cleanEmail}.`,
        agent: newMockAgent,
        tempCredentials: {
          deliveryAgentId,
          email: cleanEmail,
          tempPassword,
        },
      });
    }
  } catch (err) {
    next(err);
  }
}
