import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import './style.css';

const configList = [
  { key: 'server-config', text: 'Server Configuration' },
  { key: 'service-list', text: 'Service Configuration' }
];

class ConfigMenu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="menu-frame">
        <Menu
          defaultSelectedKeys={['server-config']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          theme="dark"
        >
          {configList.map(item => (

              <Menu.Item key={item.key}>
               <Link to={item.key}>
                <span>{item.text}</span>
                </Link>
              </Menu.Item>

          ))}
        </Menu>
      </div>
    );
  }
}

export default ConfigMenu;
