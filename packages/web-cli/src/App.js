import React, { Component } from 'react';
import {Button} from 'antd';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <p>try server render</p>
     
        </header>
        <Button>test</Button>
      </div>
    );
  }
}

export default App;
