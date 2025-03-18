/*
<aicontext>
This file defines API routes for survey operations.
</aicontext>
*/

import express from 'express';
import * as surveyController from '../controllers/survey.controller';

const router = express.Router();

// Get all surveys
router.get('/', surveyController.getAllSurveys);

// Get a specific survey by ID
router.get('/:id', surveyController.getSurveyById);

// Create a new survey
router.post('/', surveyController.createSurvey);

// Update a survey
router.put('/:id', surveyController.updateSurvey);

// Delete a survey
router.delete('/:id', surveyController.deleteSurvey);

export default router; 