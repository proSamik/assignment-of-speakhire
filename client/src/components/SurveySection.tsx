/*
<aicontext>
This component renders a section of survey questions with a title and description.
</aicontext>
*/

import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { Section } from '../store/api/surveysApiSlice';
import SurveyQuestion from './SurveyQuestion';

interface SurveySectionProps {
  section: Section;
  responses: Record<string, string | string[]>;
  onChange: (questionId: string, value: string | string[]) => void;
  errors: Record<string, string>;
}

/**
 * Component for rendering a section of survey questions
 * @param section - The section to render
 * @param responses - Current responses for questions in this section
 * @param onChange - Function to call when responses change
 * @param errors - Validation errors for questions in this section
 * @returns Survey section component
 */
const SurveySection: React.FC<SurveySectionProps> = ({
  section,
  responses,
  onChange,
  errors,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {section.title}
      </Typography>
      
      {section.description && (
        <Typography variant="body1" color="text.secondary" paragraph>
          {section.description}
        </Typography>
      )}
      
      <Divider sx={{ mb: 3 }} />
      
      <Box>
        {section.questions.map((question) => (
          <SurveyQuestion
            key={question.id}
            question={question}
            value={responses[question.id] || (question.type === 'multiple' ? [] : '')}
            onChange={onChange}
            error={errors[question.id]}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default SurveySection; 