/*
<aicontext>
This file contains controller functions for survey response operations.
</aicontext>
*/

import { Request, Response } from 'express';
import SurveyResponse from '../models/response.model';
import Survey from '../models/survey.model';
import { SubmitResponseRequest } from '../types/survey';
import { sendThankYouEmail } from '../services/email.service';

/**
 * Get all survey responses
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllResponses = async (req: Request, res: Response): Promise<void> => {
  try {
    const responses = await SurveyResponse.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Survey, as: 'survey', attributes: ['title'] }],
    });
    
    res.status(200).json(responses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ message: 'Failed to fetch responses', error });
  }
};

/**
 * Get paginated formatted responses
 * @param req - Express request object with pagination parameters
 * @param res - Express response object
 */
export const getFormattedResponses = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Get total number of responses for pagination info
    const totalCount = await SurveyResponse.count();
    
    // Get paginated responses with survey details
    const responses = await SurveyResponse.findAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ 
        model: Survey, 
        as: 'survey', 
        attributes: ['id', 'title', 'sections'] 
      }],
    });
    
    // Format responses to be more human-readable
    const formattedResponses = responses.map(response => {
      const responseData = response.get({ plain: true });
      const surveyData = (responseData as any).survey;
      
      // Create a map of question IDs to question text and options
      const questionMap = new Map();
      
      if (surveyData && surveyData.sections) {
        surveyData.sections.forEach((section: any) => {
          section.questions.forEach((question: any) => {
            // For single and multiple choice questions, create a map of option IDs to text
            const optionMap = new Map();
            if (question.options) {
              question.options.forEach((option: any) => {
                optionMap.set(option.id, option.text);
              });
            }
            
            // Store the question with its options map
            questionMap.set(question.id, {
              text: question.text,
              type: question.type,
              optionMap
            });
          });
        });
      }
      
      // Format the responses to include question text and selected option text
      const formattedUserResponses = responseData.responses.map((questionResponse: any) => {
        const questionInfo = questionMap.get(questionResponse.questionId);
        
        if (!questionInfo) {
          return {
            question: 'Unknown question',
            answer: questionResponse.answer,
          };
        }
        
        let formattedAnswer;
        
        // Format answer based on question type
        if (questionInfo.type === 'text') {
          formattedAnswer = questionResponse.answer;
        } else if (questionInfo.type === 'single') {
          // Single choice - get the option text
          formattedAnswer = questionInfo.optionMap.get(questionResponse.answer) || 'Unknown option';
        } else if (questionInfo.type === 'multiple' && Array.isArray(questionResponse.answer)) {
          // Multiple choice - get all selected option texts
          formattedAnswer = questionResponse.answer.map((optionId: string) => 
            questionInfo.optionMap.get(optionId) || 'Unknown option'
          );
        } else {
          formattedAnswer = questionResponse.answer;
        }
        
        return {
          question: questionInfo.text,
          questionType: questionInfo.type,
          answer: formattedAnswer,
        };
      });
      
      // Return the formatted response
      return {
        id: responseData.id,
        surveyTitle: surveyData ? surveyData.title : 'Unknown Survey',
        name: responseData.name || 'Anonymous',
        email: responseData.email,
        responses: formattedUserResponses,
        submittedAt: responseData.createdAt,
      };
    });
    
    // Send response with pagination info
    res.status(200).json({
      responses: formattedResponses,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      }
    });
  } catch (error) {
    console.error('Error fetching formatted responses:', error);
    res.status(500).json({ message: 'Failed to fetch responses', error });
  }
};

/**
 * Get responses for a specific survey
 * @param req - Express request object with surveyId parameter
 * @param res - Express response object
 */
export const getResponsesBySurveyId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { surveyId } = req.params;
    
    const responses = await SurveyResponse.findAll({
      where: { surveyId },
      order: [['createdAt', 'DESC']],
    });
    
    res.status(200).json(responses);
  } catch (error) {
    console.error(`Error fetching responses for survey ${req.params.surveyId}:`, error);
    res.status(500).json({ message: 'Failed to fetch survey responses', error });
  }
};

/**
 * Get formatted responses for a specific survey with pagination
 * @param req - Express request object with surveyId parameter and pagination query params
 * @param res - Express response object
 */
export const getFormattedResponsesBySurveyId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { surveyId } = req.params;
    
    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Get the survey first to access questions and options
    const survey = await Survey.findByPk(surveyId);
    
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }
    
    // Get total number of responses for this survey
    const totalCount = await SurveyResponse.count({
      where: { surveyId }
    });
    
    // Get paginated responses for this survey
    const responses = await SurveyResponse.findAll({
      where: { surveyId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    
    const surveyData = survey.get({ plain: true });
    
    // Create a map of question IDs to question text and options
    const questionMap = new Map();
    
    surveyData.sections.forEach((section: any) => {
      section.questions.forEach((question: any) => {
        // For single and multiple choice questions, create a map of option IDs to text
        const optionMap = new Map();
        if (question.options) {
          question.options.forEach((option: any) => {
            optionMap.set(option.id, option.text);
          });
        }
        
        // Store the question with its options map
        questionMap.set(question.id, {
          text: question.text,
          type: question.type,
          optionMap
        });
      });
    });
    
    // Format responses to be more human-readable
    const formattedResponses = responses.map(response => {
      const responseData = response.get({ plain: true });
      
      // Format the responses to include question text and selected option text
      const formattedUserResponses = responseData.responses.map((questionResponse: any) => {
        const questionInfo = questionMap.get(questionResponse.questionId);
        
        if (!questionInfo) {
          return {
            question: 'Unknown question',
            answer: questionResponse.answer,
          };
        }
        
        let formattedAnswer;
        
        // Format answer based on question type
        if (questionInfo.type === 'text') {
          formattedAnswer = questionResponse.answer;
        } else if (questionInfo.type === 'single') {
          // Single choice - get the option text
          formattedAnswer = questionInfo.optionMap.get(questionResponse.answer) || 'Unknown option';
        } else if (questionInfo.type === 'multiple' && Array.isArray(questionResponse.answer)) {
          // Multiple choice - get all selected option texts
          formattedAnswer = questionResponse.answer.map((optionId: string) => 
            questionInfo.optionMap.get(optionId) || 'Unknown option'
          );
        } else {
          formattedAnswer = questionResponse.answer;
        }
        
        return {
          question: questionInfo.text,
          questionType: questionInfo.type,
          answer: formattedAnswer,
        };
      });
      
      // Return the formatted response
      return {
        id: responseData.id,
        surveyTitle: surveyData.title,
        name: responseData.name || 'Anonymous',
        email: responseData.email,
        responses: formattedUserResponses,
        submittedAt: responseData.createdAt,
      };
    });
    
    // Send response with pagination info
    res.status(200).json({
      responses: formattedResponses,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      }
    });
  } catch (error) {
    console.error(`Error fetching formatted responses for survey ${req.params.surveyId}:`, error);
    res.status(500).json({ message: 'Failed to fetch survey responses', error });
  }
};

/**
 * Get a specific response by ID
 * @param req - Express request object with response ID parameter
 * @param res - Express response object
 */
export const getResponseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const response = await SurveyResponse.findByPk(id, {
      include: [{ model: Survey, as: 'survey' }],
    });
    
    if (!response) {
      res.status(404).json({ message: 'Response not found' });
      return;
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching response with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch response', error });
  }
};

/**
 * Get a formatted response by ID
 * @param req - Express request object with response ID parameter
 * @param res - Express response object
 */
export const getFormattedResponseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const response = await SurveyResponse.findByPk(id, {
      include: [{ model: Survey, as: 'survey' }],
    });
    
    if (!response) {
      res.status(404).json({ message: 'Response not found' });
      return;
    }
    
    const responseData = response.get({ plain: true });
    const surveyData = (responseData as any).survey;
    
    // Create a map of question IDs to question text and options
    const questionMap = new Map();
    
    if (surveyData && surveyData.sections) {
      surveyData.sections.forEach((section: any) => {
        section.questions.forEach((question: any) => {
          // For single and multiple choice questions, create a map of option IDs to text
          const optionMap = new Map();
          if (question.options) {
            question.options.forEach((option: any) => {
              optionMap.set(option.id, option.text);
            });
          }
          
          // Store the question with its options map
          questionMap.set(question.id, {
            text: question.text,
            type: question.type,
            optionMap
          });
        });
      });
    }
    
    // Format the responses to include question text and selected option text
    const formattedUserResponses = responseData.responses.map((questionResponse: any) => {
      const questionInfo = questionMap.get(questionResponse.questionId);
      
      if (!questionInfo) {
        return {
          question: 'Unknown question',
          answer: questionResponse.answer,
        };
      }
      
      let formattedAnswer;
      
      // Format answer based on question type
      if (questionInfo.type === 'text') {
        formattedAnswer = questionResponse.answer;
      } else if (questionInfo.type === 'single') {
        // Single choice - get the option text
        formattedAnswer = questionInfo.optionMap.get(questionResponse.answer) || 'Unknown option';
      } else if (questionInfo.type === 'multiple' && Array.isArray(questionResponse.answer)) {
        // Multiple choice - get all selected option texts
        formattedAnswer = questionResponse.answer.map((optionId: string) => 
          questionInfo.optionMap.get(optionId) || 'Unknown option'
        );
      } else {
        formattedAnswer = questionResponse.answer;
      }
      
      return {
        question: questionInfo.text,
        questionType: questionInfo.type,
        answer: formattedAnswer,
      };
    });
    
    // Return the formatted response
    const formattedResponse = {
      id: responseData.id,
      surveyTitle: surveyData ? surveyData.title : 'Unknown Survey',
      name: responseData.name || 'Anonymous',
      email: responseData.email,
      responses: formattedUserResponses,
      submittedAt: responseData.createdAt,
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error(`Error fetching formatted response with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch response', error });
  }
};

/**
 * Submit a new survey response
 * @param req - Express request object with response data in body
 * @param res - Express response object
 */
export const submitResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { surveyId, email, name, responses } = req.body as SubmitResponseRequest;
    
    if (!surveyId || !email || !responses || !Array.isArray(responses) || responses.length === 0) {
      res.status(400).json({ 
        message: 'Invalid response data. Survey ID, email, and at least one response are required.' 
      });
      return;
    }
    
    // Check if survey exists
    const survey = await Survey.findByPk(surveyId);
    
    if (!survey) {
      res.status(404).json({ message: 'Survey not found' });
      return;
    }
    
    // Create response
    const newResponse = await SurveyResponse.create({
      surveyId,
      email,
      name: name || null,
      responses
    });
    
    // Send thank you email
    const emailSent = await sendThankYouEmail(email, name || null, survey.title);
    
    res.status(201).json({ 
      message: 'Response submitted successfully',
      emailSent,
      response: newResponse
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ message: 'Failed to submit response', error });
  }
};

/**
 * Delete a survey response
 * @param req - Express request object with response ID parameter
 * @param res - Express response object
 */
export const deleteResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const response = await SurveyResponse.findByPk(id);
    
    if (!response) {
      res.status(404).json({ message: 'Response not found' });
      return;
    }
    
    await response.destroy();
    
    res.status(200).json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error(`Error deleting response with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete response', error });
  }
}; 