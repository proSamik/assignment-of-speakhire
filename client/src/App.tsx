/*
<aicontext>
This is the main application component that sets up the Redux store, theme provider, and routing.
</aicontext>
*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { ThemeProvider } from './theme/ThemeProvider';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SurveyPage from './pages/SurveyPage';
import SuccessPage from './pages/SuccessPage';

/**
 * Main application component
 * @returns Application component with providers and routing
 */
const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <ThemeProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/survey/:surveyId" element={<SurveyPage />} />
                <Route path="/survey/:surveyId/success" element={<SuccessPage />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App; 