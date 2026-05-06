import { Router } from 'express';
import * as responseController from '../controllers/responseController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route for submitting responses
router.post('/', responseController.createResponse);

// Check if user has responded (public)
router.get('/check/:surveyId', responseController.hasUserResponded);

// All other response routes require authentication
router.use(authenticate);

router.get('/', responseController.getResponses);
router.get('/survey/:surveyId', responseController.getResponsesBySurvey);
router.get('/:id', responseController.getResponseById);
router.delete('/:id', responseController.deleteResponse);

export default router;