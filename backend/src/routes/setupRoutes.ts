import { Router } from 'express';
import * as setupController from '../controllers/setupController';

const router = Router();

// Setup routes (no authentication required)
router.post('/migrate', setupController.runMigration);
router.post('/seed', setupController.runSeed);

export default router;