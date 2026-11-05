import { Router } from 'express';
import {
  createChannel,
  getFarmerChannels,
  assignAgentsToChannel,
  removeAgentFromChannel,
  getAvailableDeliveryAgents,
  addNewDeliveryBoy,
} from '../controllers/farmerChannelController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('FARMER', 'SUPER_ADMIN'));

router.get('/channels', getFarmerChannels);
router.post('/channels', createChannel);
router.post('/channels/:channelId/agents', assignAgentsToChannel);
router.delete('/channels/:channelId/agents/:agentId', removeAgentFromChannel);
router.get('/agents', getAvailableDeliveryAgents);
router.post('/agents', addNewDeliveryBoy);

export default router;
