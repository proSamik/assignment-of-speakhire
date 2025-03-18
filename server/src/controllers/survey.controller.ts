/*
<aicontext>
This file contains controller functions for survey operations.
</aicontext>
*/

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Survey from '../models/survey.model';
import { Survey as SurveyType } from '../types/survey';

/**
 * Get all surveys
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllSurveys = async (req: Request, res: Response): Promise<void> => {
  try {
    const surveys = await Survey.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ message: 'Failed to fetch surveys', error });
  }
};

/**
 * Get a specific survey by ID
 * @param req - Express request object with survey ID parameter
 * @param res - Express response object
 */
export const getSurveyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const survey = await Survey.findByPk(id);
    
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }
    
    res.status(200).json(survey);
  } catch (error) {
    console.error(`Error fetching survey with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch survey', error });
  }
};

/**
 * Create a new survey
 * @param req - Express request object with survey data in body
 * @param res - Express response object
 */
export const createSurvey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, sections } = req.body as SurveyType;
    
    if (!title || !sections || !Array.isArray(sections) || sections.length === 0) {
      res.status(400).json({ message: 'Invalid survey data. Title and at least one section are required.' });
      return;
    }
    
    // Assign IDs to sections and questions if not provided
    const processedSections = sections.map(section => ({
      ...section,
      id: section.id || uuidv4(),
      questions: (section.questions || []).map(question => ({
        ...question,
        id: question.id || uuidv4(),
        options: (question.options || []).map(option => ({
          ...option,
          id: option.id || uuidv4()
        }))
      }))
    }));
    
    const newSurvey = await Survey.create({
      title,
      description: description || null,
      sections: processedSections
    });
    
    res.status(201).json(newSurvey);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ message: 'Failed to create survey', error });
  }
};

/**
 * Update an existing survey
 * @param req - Express request object with survey ID parameter and updated data in body
 * @param res - Express response object
 */
export const updateSurvey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, sections } = req.body as SurveyType;
    
    const survey = await Survey.findByPk(id);
    
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }
    
    // Update the survey
    await survey.update({
      title: title || survey.title,
      description: description !== undefined ? description : survey.description,
      sections: sections || survey.sections
    });
    
    res.status(200).json(survey);
  } catch (error) {
    console.error(`Error updating survey with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to update survey', error });
  }
};

/**
 * Delete a survey
 * @param req - Express request object with survey ID parameter
 * @param res - Express response object
 */
export const deleteSurvey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const survey = await Survey.findByPk(id);
    
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }
    
    await survey.destroy();
    
    res.status(200).json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error(`Error deleting survey with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete survey', error });
  }
}; 