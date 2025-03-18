/*
<aicontext>
This page displays a success message after a user completes a survey.
</aicontext>
*/

import React from 'react';
import { Button, Container, Paper, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Success page component displayed after successful survey submission
 * @returns Success page component
 */
const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', py: 6 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center'
        }}
      >
        <CheckCircleIcon 
          color="success" 
          sx={{ 
            fontSize: 64, 
            mb: 2 
          }} 
        />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Thank You!
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Your survey response has been submitted successfully.
        </Typography>
        
        <Typography variant="body2" paragraph color="text.secondary">
          We appreciate your time and feedback. A confirmation email has been sent to your provided email address.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default SuccessPage; 