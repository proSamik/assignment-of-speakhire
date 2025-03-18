/*
<aicontext>
This hook provides easy access to user preferences and actions to update them.
</aicontext>
*/

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  // Actions
  addSelectedSurvey,
  removeSelectedSurvey,
  setLastVisitedSurvey,
  markSurveyCompleted,
  toggleFavoriteResponse,
  updateUiOptions,
  updateSurveyResponses,
  updateUserInfo,
  clearSurveyResponses,
  resetPreferences,
  
  // Types
  UserPreferencesState,
  SurveyResponse
} from '../store/slices/userPreferencesSlice';

/**
 * Hook for accessing and updating user preferences
 * @returns Object with user preferences state and actions to update them
 */
export const useUserPreferences = () => {
  const dispatch = useDispatch();
  
  // Get all preferences directly from state
  const preferences = useSelector((state: RootState) => state.userPreferences);
  
  return {
    selectedSurveyIds: preferences.selectedSurveyIds,
    lastVisitedSurveyId: preferences.lastVisitedSurveyId,
    completedSurveys: preferences.completedSurveys,
    favoriteResponses: preferences.favoriteResponses,
    uiOptions: preferences.uiOptions,
    
    // Actions
    addSelectedSurvey: (surveyId: string) => dispatch(addSelectedSurvey(surveyId)),
    removeSelectedSurvey: (surveyId: string) => dispatch(removeSelectedSurvey(surveyId)),
    setLastVisitedSurvey: (surveyId: string | null) => dispatch(setLastVisitedSurvey(surveyId)),
    markSurveyCompleted: (surveyId: string) => dispatch(markSurveyCompleted(surveyId)),
    toggleFavoriteResponse: (responseId: string) => dispatch(toggleFavoriteResponse(responseId)),
    updateUiOptions: (options: Partial<UserPreferencesState['uiOptions']>) => dispatch(updateUiOptions(options)),
    resetPreferences: () => dispatch(resetPreferences()),
    
    // Form actions
    updateSurveyResponses: (surveyId: string, responses: SurveyResponse) => 
      dispatch(updateSurveyResponses({ surveyId, responses })),
    updateUserInfo: (surveyId: string, userInfo: { email: string; name: string }) => 
      dispatch(updateUserInfo({ surveyId, userInfo })),
    clearSurveyResponses: (surveyId: string) => 
      dispatch(clearSurveyResponses(surveyId)),
    
    // Selectors for form data with safe access
    getSurveyResponses: (surveyId: string) => {
      // Safely access nested properties with optional chaining and provide default empty object
      return preferences?.surveyResponses?.[surveyId] || {};
    },
    getUserInfo: (surveyId: string) => {
      // Safely access nested properties with optional chaining and provide default empty object
      return preferences?.userInfo?.[surveyId] || { email: '', name: '' };
    },
    
    // Helper functions
    isSurveySelected: (surveyId: string) => preferences.selectedSurveyIds.includes(surveyId),
    isSurveyCompleted: (surveyId: string) => preferences.completedSurveys.includes(surveyId),
    isResponseFavorite: (responseId: string) => preferences.favoriteResponses.includes(responseId)
  };
};

export default useUserPreferences; 