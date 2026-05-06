import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route for login
router.post('/login', adminController.login);

// All other admin routes require authentication
router.use(authenticate);

// Admin management
router.get('/', adminController.getAdmins);
router.post('/', adminController.createAdmin);
router.delete('/:id', adminController.deleteAdmin);
router.put('/:id/password', adminController.updateAdminPassword);

// Statistics
router.get('/stats/overview', adminController.getStats);

export default router;