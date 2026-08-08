import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { captureAttribution } from './utils/attribution';
import './styles/offer.css';
import './styles/roadmap.css';
import './styles/tokens.css';
import './styles/sections.css';
import './styles/mobile.css';
import './styles/polish.css';
import './styles/interactions.css';
import './styles/theme.css';
import './styles/community.css';
import './styles/advisor.css';
import './styles/buttons.css';

// Record campaign parameters before the router rewrites the URL.
captureAttribution();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
