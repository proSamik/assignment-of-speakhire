/*
<aicontext>
This is the home page component that displays a list of available surveys.
</aicontext>
*/

import React from 'react';
import { 
  Alert,
  Button, 
  Card, 
  CardActions, 
  CardContent, 
  CircularProgress, 
  Container, 
  Grid, 
  Typography,
  Divider,
  Box
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useGetSurveysQuery } from '../store/api/surveysApiSlice';

/**
 * Home page component displaying available surveys
 * @returns Home page component
 */
const HomePage: React.FC = () => {
  const { data: surveys, isLoading, isError, error } = useGetSurveysQuery();

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Available Surveys
      </Typography>
      <Typography variant="subtitle1" paragraph align="center" color="text.secondary">
        Select a survey to begin
      </Typography>

      {isLoading && (
        <Grid container justifyContent="center" sx={{ my: 4 }}>
          <CircularProgress />
        </Grid>
      )}

      {isError && (
        <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
          {(error as any)?.data?.message || 'Failed to load surveys. Please try again later.'}
        </Alert>
      )}

      {!isLoading && !isError && surveys?.length === 0 && (
        <Alert severity="info" sx={{ mt: 3, mb: 2 }}>
          No surveys available at the moment.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {surveys?.map((survey) => (
          <Grid item xs={12} sm={6} md={4} key={survey.id}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {survey.title}
                </Typography>
                {survey.description && (
                  <Typography variant="body2" color="text.secondary">
                    {survey.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  component={RouterLink} 
                  to={`/survey/${survey.id}`} 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                >
                  Take Survey
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage; 