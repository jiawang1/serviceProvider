import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import Menu from './menu';
import ServerConfig from './routes/server-config';
import ServiceList from './routes/service-list';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">


        <HashRouter>
          <React.Fragment>
          <Menu />
          <div className="app-content">

              <ServerConfig />
              <ServiceList />
              </div>
          </React.Fragment>
        </HashRouter>

      </div>
    );
  }
}

export default App;
