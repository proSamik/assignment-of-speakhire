/*
<aicontext>
This file contains TypeScript interfaces for survey data structures.
</aicontext>
*/

// Option for a survey question
export interface Option {
  id: string;
  text: string;
}

// Question in a survey section
export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text' | 'range';
  required: boolean;
  options?: Option[];
  rangeMin?: number;
  rangeMax?: number;
  rangeLabels?: {
    min: string;
    max: string;
  };
}

// Section of a survey
export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

// Full survey structure
export interface Survey {
  id: string;
  title: string;
  description?: string;
  sections: Section[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Survey response from a user
export interface SurveyResponse {
  id: string;
  surveyId: string;
  email: string;
  name?: string;
  responses: {
    questionId: string;
    answer: string | string[] | number;
  }[];
  createdAt?: Date;
}

// Request to submit a survey response
export interface SubmitResponseRequest {
  surveyId: string;
  email: string;
  name?: string;
  responses: {
    questionId: string;
    answer: string | string[] | number;
  }[];
} 