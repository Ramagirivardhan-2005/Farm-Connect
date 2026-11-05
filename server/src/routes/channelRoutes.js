import { Router } from 'express';
import { getChannels, getChannelById, createChannel } from '../controllers/channelController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getChannels);
router.get('/:channelId', getChannelById);
router.post('/apply', authenticate, createChannel);

export default router;
