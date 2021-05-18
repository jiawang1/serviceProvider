import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">header</header>
        <div className="app-body">
          <Routes />
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
