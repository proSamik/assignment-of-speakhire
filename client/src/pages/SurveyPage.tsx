/*
<aicontext>
This page displays a survey for users to fill out, with validation and submission functionality.
</aicontext>
*/

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Alert, 
  Box, 
  Button, 
  CircularProgress, 
  Container, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Typography 
} from '@mui/material';
import { useGetSurveyByIdQuery } from '../store/api/surveysApiSlice';
import { useSubmitResponseMutation } from '../store/api/responsesApiSlice';
import SurveySection from '../components/SurveySection';
import useUserPreferences from '../hooks/useUserPreferences';

/**
 * Survey page component for displaying and taking a survey
 * @returns Survey page component
 */
const SurveyPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  
  // Get user preferences and form data directly from the custom hook
  const { 
    setLastVisitedSurvey, 
    markSurveyCompleted, 
    isSurveyCompleted,
    updateSurveyResponses,
    updateUserInfo,
    getSurveyResponses,
    getUserInfo
  } = useUserPreferences();
  
  // Get persisted form data from Redux using the hook's accessor methods
  const savedResponses = surveyId ? getSurveyResponses(surveyId) : {};
  const savedUserInfo = surveyId ? getUserInfo(surveyId) : { email: '', name: '' };
  
  const { data: survey, isLoading: surveyLoading, isError: surveyError } = useGetSurveyByIdQuery(
    surveyId || ''
  );
  
  const [submitResponse, { isLoading: submitting }] = useSubmitResponseMutation();
  
  // State for active step in stepper
  const [activeStep, setActiveStep] = useState(0);
  
  // Use persisted responses from Redux, falling back to empty object
  const [responses, setResponses] = useState(savedResponses);
  
  // Use persisted user info from Redux, falling back to empty values
  const [userInfo, setUserInfo] = useState(savedUserInfo);
  
  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate total number of steps (sections + user info)
  const totalSteps = survey ? survey.sections.length + 1 : 1;
  
  // Store the last visited survey ID when component mounts or surveyId changes
  useEffect(() => {
    if (surveyId) {
      setLastVisitedSurvey(surveyId);
    }
  }, [surveyId, setLastVisitedSurvey]);
  
  // Handle response changes
  const handleResponseChange = (questionId: string, value: string | string[]) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
    
    // Save responses to Redux
    if (surveyId) {
      updateSurveyResponses(surveyId, newResponses);
    }
    
    // Clear error for this question if it exists
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };
  
  // Handle user info changes
  const handleUserInfoChange = (field: 'email' | 'name', value: string) => {
    const newUserInfo = { ...userInfo, [field]: value };
    setUserInfo(newUserInfo);
    
    // Save user info to Redux
    if (surveyId) {
      updateUserInfo(surveyId, newUserInfo);
    }
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Validate the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (activeStep < (survey?.sections.length || 0)) {
      // Validate section questions
      const currentSection = survey?.sections[activeStep];
      
      currentSection?.questions.forEach((question) => {
        if (question.required) {
          const response = responses[question.id];
          
          if (!response || (Array.isArray(response) && response.length === 0)) {
            newErrors[question.id] = 'This question is required';
          }
        }
      });
    } else {
      // Validate user info
      if (!userInfo.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (activeStep === totalSteps - 1) {
        handleSubmit();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle survey submission
  const handleSubmit = async () => {
    if (!survey || !surveyId) return;
    
    try {
      // Format responses for submission
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      
      // Submit response
      await submitResponse({
        surveyId: survey.id,
        email: userInfo.email,
        name: userInfo.name || undefined,
        responses: formattedResponses,
      }).unwrap();
      
      // Mark survey as completed in Redux store
      markSurveyCompleted(surveyId);
      
      // Navigate to success page
      navigate(`/survey/${survey.id}/success`);
    } catch (err) {
      console.error('Failed to submit survey response:', err);
      setErrors({
        submit: 'Failed to submit your response. Please try again.',
      });
    }
  };
  
  // Render loading state
  if (surveyLoading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading survey...
        </Typography>
      </Container>
    );
  }
  
  // Render error state
  if (surveyError || !survey) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Survey not found or failed to load. Please try again later.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }
  
  // Check if survey has already been completed
  const surveyCompleted = surveyId ? isSurveyCompleted(surveyId) : false;
  
  // Function to render the appropriate component based on active step
  const renderStepContent = () => {
    if (activeStep < survey.sections.length) {
      return (
        <SurveySection
          section={survey.sections[activeStep]}
          responses={responses}
          onChange={handleResponseChange}
          errors={errors}
        />
      );
    } else {
      // Replace with UserInfoForm or your custom form for user info
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Your Information
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography>Email *</Typography>
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) => handleUserInfoChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: errors.email ? '1px solid red' : '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            {errors.email && (
              <Typography color="error" variant="caption">
                {errors.email}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography>Name (optional)</Typography>
            <input
              type="text"
              value={userInfo.name}
              onChange={(e) => handleUserInfoChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </Box>
        </Box>
      );
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {survey.title}
        </Typography>
        
        {survey.description && (
          <Typography variant="body1" paragraph align="center" color="text.secondary">
            {survey.description}
          </Typography>
        )}
        
        {surveyCompleted && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have already completed this survey. You can submit it again if you want.
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 5 }}>
          {survey.sections.map((section) => (
            <Step key={section.id}>
              <StepLabel>{section.title}</StepLabel>
            </Step>
          ))}
          <Step>
            <StepLabel>Your Information</StepLabel>
          </Step>
        </Stepper>
        
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}
        
        <Box sx={{ mt: 2, mb: 4 }}>
          {renderStepContent()}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/') : handleBack}
            disabled={submitting}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={submitting}
          >
            {activeStep === totalSteps - 1 ? (
              submitting ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Submitting...
                </>
              ) : (
                'Submit'
              )
            ) : (
              'Next'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SurveyPage; 