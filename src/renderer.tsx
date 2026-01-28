import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from './Dashboard'; // Your task list component
import './index.css'; // For your sidebar styling

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Dashboard userRole="TeamLead" /> 
  </React.StrictMode>
);