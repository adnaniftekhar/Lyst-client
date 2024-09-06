import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StyleSheetManager shouldForwardProp={(prop) => prop !== 'theme'}>
      <App />
    </StyleSheetManager>
  </React.StrictMode>
);
