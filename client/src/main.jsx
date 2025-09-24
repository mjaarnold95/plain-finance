import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
createRoot(document.getElementById('root')).render(<App />);

.app { max-width: 900px; margin: 2rem auto; font-family: system-ui, sans-serif; }
button { margin-right: .5rem; padding: .5rem .8rem; }
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th, td { border-bottom: 1px solid #ddd; padding: .5rem; text-align: left; }
