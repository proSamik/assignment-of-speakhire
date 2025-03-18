/*
<aicontext>
This file defines API endpoints for survey response operations using RTK Query.
</aicontext>
*/

import { apiSlice } from './apiSlice';

export interface SurveyResponse {
  id: string;
  surveyId: string;
  email: string;
  name?: string;
  responses: QuestionResponse[];
  createdAt?: string;
}

export interface QuestionResponse {
  questionId: string;
  answer: string | string[];
}

export interface SubmitResponseRequest {
  surveyId: string;
  email: string;
  name?: string;
  responses: QuestionResponse[];
}

export interface SubmitResponseResponse {
  message: string;
  emailSent: boolean;
  response: SurveyResponse;
}

/**
 * Extended API slice for survey response-related endpoints
 */
export const responsesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Submit a survey response
    submitResponse: builder.mutation<SubmitResponseResponse, SubmitResponseRequest>({
      query: (response) => ({
        url: '/responses',
        method: 'POST',
        body: response,
      }),
      invalidatesTags: (result) => [
        { type: 'Response', id: result?.response.surveyId },
        { type: 'Response', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useSubmitResponseMutation,
} = responsesApiSlice; 