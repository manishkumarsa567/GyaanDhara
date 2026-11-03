import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
