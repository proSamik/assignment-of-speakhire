/*
<aicontext>
This file contains the redux slice for storing user preferences that persist across sessions.
</aicontext>
*/

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Define response type
export type SurveyResponse = Record<string, string | string[]>;

// Define the interface for the user preferences state
export interface UserPreferencesState {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  selectedSurveyIds: string[];
  lastVisitedSurveyId: string | null;
  completedSurveys: string[];
  favoriteResponses: string[];
  // Map to store responses for each survey
  surveyResponses: Record<string, SurveyResponse>;
  // Store user info per survey
  userInfo: Record<string, { email: string; name: string }>;
  uiOptions: {
    compactView: boolean;
    showHelp: boolean;
    autoSave: boolean;
  };
}

// Define the initial state
const initialState: UserPreferencesState = {
  theme: 'light',
  fontSize: 'medium',
  selectedSurveyIds: [],
  lastVisitedSurveyId: null,
  completedSurveys: [],
  favoriteResponses: [],
  surveyResponses: {},
  userInfo: {},
  uiOptions: {
    compactView: false,
    showHelp: true,
    autoSave: true,
  },
};

/**
 * User preferences slice for storing persistent user settings
 */
export const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    /**
     * Set the theme preference
     * @param state Current state
     * @param action Payload with theme value
     */
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },

    /**
     * Set the font size preference
     * @param state Current state
     * @param action Payload with font size value
     */
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
    },

    /**
     * Add a survey to selected surveys
     * @param state Current state
     * @param action Payload with survey ID
     */
    addSelectedSurvey: (state, action: PayloadAction<string>) => {
      if (!state.selectedSurveyIds.includes(action.payload)) {
        state.selectedSurveyIds.push(action.payload);
      }
    },

    /**
     * Remove a survey from selected surveys
     * @param state Current state
     * @param action Payload with survey ID
     */
    removeSelectedSurvey: (state, action: PayloadAction<string>) => {
      state.selectedSurveyIds = state.selectedSurveyIds.filter(id => id !== action.payload);
    },

    /**
     * Set the last visited survey ID
     * @param state Current state
     * @param action Payload with survey ID
     */
    setLastVisitedSurvey: (state, action: PayloadAction<string | null>) => {
      state.lastVisitedSurveyId = action.payload;
    },

    /**
     * Mark a survey as completed
     * @param state Current state
     * @param action Payload with survey ID
     */
    markSurveyCompleted: (state, action: PayloadAction<string>) => {
      if (!state.completedSurveys.includes(action.payload)) {
        state.completedSurveys.push(action.payload);
      }
    },

    /**
     * Toggle a response as favorite
     * @param state Current state
     * @param action Payload with response ID
     */
    toggleFavoriteResponse: (state, action: PayloadAction<string>) => {
      const index = state.favoriteResponses.indexOf(action.payload);
      if (index === -1) {
        state.favoriteResponses.push(action.payload);
      } else {
        state.favoriteResponses.splice(index, 1);
      }
    },

    /**
     * Update UI options
     * @param state Current state
     * @param action Payload with UI options to update
     */
    updateUiOptions: (state, action: PayloadAction<Partial<UserPreferencesState['uiOptions']>>) => {
      state.uiOptions = {
        ...state.uiOptions,
        ...action.payload,
      };
    },

    /**
     * Update form responses for a specific survey
     * @param state Current state
     * @param action Payload with survey ID and responses
     */
    updateSurveyResponses: (state, action: PayloadAction<{ surveyId: string; responses: SurveyResponse }>) => {
      const { surveyId, responses } = action.payload;
      state.surveyResponses = {
        ...state.surveyResponses,
        [surveyId]: responses
      };
    },

    /**
     * Update user info for a specific survey
     * @param state Current state
     * @param action Payload with survey ID and user info
     */
    updateUserInfo: (state, action: PayloadAction<{ 
      surveyId: string; 
      userInfo: { email: string; name: string } 
    }>) => {
      const { surveyId, userInfo } = action.payload;
      state.userInfo = {
        ...state.userInfo,
        [surveyId]: userInfo
      };
    },

    /**
     * Clear stored responses for a specific survey
     * @param state Current state
     * @param action Payload with survey ID
     */
    clearSurveyResponses: (state, action: PayloadAction<string>) => {
      const surveyId = action.payload;
      if (state.surveyResponses[surveyId]) {
        const newResponses = { ...state.surveyResponses };
        delete newResponses[surveyId];
        state.surveyResponses = newResponses;
      }
    },

    /**
     * Reset all preferences to default values
     * @param state Current state
     */
    resetPreferences: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const {
  setTheme,
  setFontSize,
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
} = userPreferencesSlice.actions;

export const selectSelectedSurveyIds = (state: RootState) => state.userPreferences.selectedSurveyIds;
export const selectLastVisitedSurveyId = (state: RootState) => state.userPreferences.lastVisitedSurveyId;
export const selectCompletedSurveys = (state: RootState) => state.userPreferences.completedSurveys;
export const selectFavoriteResponses = (state: RootState) => state.userPreferences.favoriteResponses;
export const selectUiOptions = (state: RootState) => state.userPreferences.uiOptions;
export const selectSurveyResponses = (state: RootState, surveyId: string) => 
  state.userPreferences.surveyResponses[surveyId] || {};
export const selectUserInfo = (state: RootState, surveyId: string) => 
  state.userPreferences.userInfo[surveyId] || { email: '', name: '' };

// Export reducer
export default userPreferencesSlice.reducer;