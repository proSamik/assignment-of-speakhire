/*
<aicontext>
This file defines API routes for survey response operations.
</aicontext>
*/

import express from 'express';
import * as responseController from '../controllers/response.controller';

const router = express.Router();

// Get all responses
router.get('/', responseController.getAllResponses);

// Get formatted responses with pagination
router.get('/formatted', responseController.getFormattedResponses);

// Get responses for a specific survey
router.get('/survey/:surveyId', responseController.getResponsesBySurveyId);

// Get formatted responses for a specific survey with pagination
router.get('/survey/:surveyId/formatted', responseController.getFormattedResponsesBySurveyId);

// Get a specific response by ID
router.get('/:id', responseController.getResponseById);

// Get a formatted response by ID
router.get('/:id/formatted', responseController.getFormattedResponseById);

// Submit a new survey response
router.post('/', responseController.submitResponse);

// Delete a response
router.delete('/:id', responseController.deleteResponse);

export default router; 