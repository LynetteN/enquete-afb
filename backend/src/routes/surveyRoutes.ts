import { Router } from 'express';
import * as surveyController from '../controllers/surveyController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All survey routes require authentication
router.use(authenticate);

// Survey CRUD operations
router.post('/', surveyController.createSurvey);
router.get('/', surveyController.getSurveys);
router.get('/latest', surveyController.getLatestSurvey);
router.get('/:id', surveyController.getSurveyById);
router.put('/:id', surveyController.updateSurvey);
router.delete('/:id', surveyController.deleteSurvey);

export default router;