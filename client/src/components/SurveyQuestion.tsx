/*
<aicontext>
This component renders different types of survey questions (single choice, multiple choice, text).
</aicontext>
*/

import React from 'react';
import { 
  FormControl, 
  FormControlLabel, 
  FormGroup, 
  FormHelperText, 
  FormLabel, 
  Radio, 
  RadioGroup, 
  Checkbox, 
  TextField, 
  Typography,
  Slider,
  Box,
  Stack
} from '@mui/material';
import { Question } from '../store/api/surveysApiSlice';

interface SurveyQuestionProps {
  question: Question;
  value: string | string[] | number;
  onChange: (questionId: string, value: string | string[] | number) => void;
  error?: string;
}

/**
 * Component for rendering different types of survey questions
 * @param question - The question to render
 * @param value - Current answer value
 * @param onChange - Function to call when the answer changes
 * @param error - Error message to display if validation fails
 * @returns Survey question component
 */
const SurveyQuestion: React.FC<SurveyQuestionProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  const handleChange = (newValue: string | string[] | number) => {
    onChange(question.id, newValue);
  };

  // Handle different question types
  switch (question.type) {
    case 'single':
      return (
        <FormControl 
          component="fieldset" 
          required={question.required} 
          error={!!error}
          sx={{ mb: 3, width: '100%' }}
        >
          <FormLabel component="legend">{question.text}</FormLabel>
          <RadioGroup
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
          >
            {question.options?.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id}
                control={<Radio />}
                label={option.text}
              />
            ))}
          </RadioGroup>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    case 'multiple':
      return (
        <FormControl 
          component="fieldset" 
          required={question.required} 
          error={!!error}
          sx={{ mb: 3, width: '100%' }}
        >
          <FormLabel component="legend">{question.text}</FormLabel>
          <FormGroup>
            {question.options?.map((option) => (
              <FormControlLabel
                key={option.id}
                control={
                  <Checkbox
                    checked={(value as string[])?.includes(option.id)}
                    onChange={(e) => {
                      const currentValues = (value as string[]) || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.id]
                        : currentValues.filter((id) => id !== option.id);
                      handleChange(newValues);
                    }}
                  />
                }
                label={option.text}
              />
            ))}
          </FormGroup>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    case 'text':
      return (
        <FormControl 
          fullWidth 
          required={question.required} 
          error={!!error}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1" gutterBottom>
            {question.text}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={value as string}
            onChange={(e) => handleChange(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </FormControl>
      );

    case 'range':
      const min = question.rangeMin ?? 0;
      const max = question.rangeMax ?? 10;
      const minLabel = question.rangeLabels?.min ?? `${min}`;
      const maxLabel = question.rangeLabels?.max ?? `${max}`;
      
      return (
        <FormControl 
          fullWidth 
          required={question.required} 
          error={!!error}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1" gutterBottom>
            {question.text}
          </Typography>
          
          <Box sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
            {/* Value display */}
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="h6">
                {typeof value === 'number' ? value : min}
              </Typography>
            </Box>
            
            {/* Slider with compact marks on mobile */}
            <Slider
              value={typeof value === 'number' ? value : min}
              min={min}
              max={max}
              step={1}
              marks={[
                { value: min, label: '' },
                { value: max, label: '' }
              ]}
              valueLabelDisplay="auto"
              onChange={(_, newValue) => handleChange(newValue as number)}
              sx={{
                '& .MuiSlider-markLabel': {
                  fontSize: '0.75rem',
                },
              }}
            />
            
            {/* Range labels below slider */}
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              sx={{ mt: 1 }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  maxWidth: '45%', 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  overflowWrap: 'break-word' 
                }}
              >
                {minLabel}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  maxWidth: '45%', 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  textAlign: 'right',
                  overflowWrap: 'break-word' 
                }}
              >
                {maxLabel}
              </Typography>
            </Stack>
          </Box>
          
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );

    default:
      return null;
  }
};

export default SurveyQuestion; 