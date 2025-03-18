/*
<aicontext>
This file defines API endpoints for survey CRUD operations using RTK Query.
</aicontext>
*/

import { apiSlice } from './apiSlice';

export interface Survey {
  id: string;
  title: string;
  description?: string;
  sections: Section[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  required: boolean;
  options?: Option[];
}

export interface Option {
  id: string;
  text: string;
}

/**
 * Extended API slice for survey-related endpoints
 */
export const surveysApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all surveys
    getSurveys: builder.query<Survey[], void>({
      query: () => '/surveys',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Survey' as const, id })),
              { type: 'Survey', id: 'LIST' },
            ]
          : [{ type: 'Survey', id: 'LIST' }],
    }),
    
    // Get a single survey by ID
    getSurveyById: builder.query<Survey, string>({
      query: (id) => `/surveys/${id}`,
      providesTags: (result, error, id) => [{ type: 'Survey', id }],
    }),
    
  }),
});

export const {
  useGetSurveysQuery,
  useGetSurveyByIdQuery,
} = surveysApiSlice; 