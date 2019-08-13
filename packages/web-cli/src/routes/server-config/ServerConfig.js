import React from 'react';
import fetch from 'whatwg-fetch';
import { Form, Input, Radio, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button } from 'antd';
import { getJson, postJson } from '../../common/commonService';
import './style.css';
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {
    xs: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 8 }
  }
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 16,
      offset: 8
    }
  }
};

class ServerConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      port: null,
      cacheStrategy: null,
      workingMode: null,
      sync: false,
      toDatabase: false,
      databaseName: null
    };
    getJson('/__config__/__service__/serverState').then(data => {
      this.setState(data);
    });
  }

  componentWillUnmount(){
    console.log('server config will unmount');
  }

  onChangeCacheStrategy = e => {};

  onChangeWorkingMode = e => {};

  onSync = e => {};

  onChangeToDB = e => {};

  onSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        postJson('/__config__/__service__/serverState', values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="server-form">
        <Form>
          <FormItem {...formItemLayout} label="Port">
            {getFieldDecorator('port', {
              rules: [
                {
                  required: true,
                  message: 'Please input your server port'
                }
              ],
              initialValue: Number(this.state.port)
            })(<Input />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Cache Strategy">
            {getFieldDecorator('cacheStrategy', {
              rules: [
                {
                  required: true,
                  message: 'Please select cache strategy'
                },
                {
                  validator: (rule, value, cb) => {
                    try {
                      const val = Number(value);
                      if (Number.isNaN(val)) {
                        cb('not valid port');
                      } else {
                        cb();
                      }
                    } catch (e) {
                      cb('not valid port');
                    }
                  }
                }
              ],
              initialValue: this.state.cacheStrategy
            })(
              <Select onChange={this.onChangeCacheStrategy}>
                <Option value={0}>Cache First</Option>
                <Option value={1}>Remote First</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Working Mode">
            {getFieldDecorator('workingMode', {
              rules: [
                {
                  required: true,
                  message: 'Please select working mode'
                }
              ],
              initialValue: this.state.workingMode
            })(
              <Select onChange={this.onChangeWorkingMode}>
                <Option value={0}>Proxy Cache</Option>
                <Option value={1}>Data Provider</Option>
                <Option value={2}>Service Provider</Option>
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label="Cache Automatically">
            {getFieldDecorator('sync', {
              rules: [
                {
                  required: true,
                  message: 'Please select whther sync cache'
                }
              ],
              initialValue: this.state.sync
            })(
              <Select onChange={this.onSync}>
                <Option value={true}>true</Option>
                <Option value={false}>false</Option>
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label="To database">
            {getFieldDecorator('toDatabase', {
              initialValue: this.state.toDatabase
            })(
              <Select onChange={this.onChangeToDB}>
                <Option value={true}>true</Option>
                <Option value={false}>false</Option>
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label="Database Name">
            {getFieldDecorator('databaseName', {
              initialValue: this.state.databaseName
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="End Server Address">
            {getFieldDecorator('endpointServer.address', {
              initialValue: this.state['endpointServer.address']
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="End Server Port">
            {getFieldDecorator('endpointServer.port', {
              initialValue: this.state['endpointServer.port']
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="End Server Host">
            {getFieldDecorator('endpointServer.host', {
              initialValue: this.state['endpointServer.host']
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Basic auth User">
            {getFieldDecorator('endpointServer.user', {
              initialValue: this.state['endpointServer.user']
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Basic auth Password">
            {getFieldDecorator('endpointServer.password', {
              initialValue: this.state['endpointServer.password']
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="SSL Key">
            {getFieldDecorator('SSLKey', {
              initialValue: this.state.SSLKey
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="SSL Cert">
            {getFieldDecorator('SSLCert', {
              initialValue: this.state.SSLCert
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Root File Path">
            {getFieldDecorator('rootPath', {
              initialValue: this.state.rootPath
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="static resource">
            {getFieldDecorator('resourceRoute', {
              initialValue: this.state.resourceRoute
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Proxy Host">
            {getFieldDecorator('proxy.host', {
              initialValue: this.state['proxy.host']
            })(<Input />)}
          </FormItem>

          <FormItem {...formItemLayout} label="Proxy Port">
            {getFieldDecorator('proxy.port', {
              initialValue: this.state['proxy.port']
            })(<Input />)}
          </FormItem>

          <FormItem {...tailFormItemLayout}>
            <Button type="primary" onClick={this.onSubmit}>
              Save
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const ServerConfigWithForm = Form.create()(ServerConfig);

export default ServerConfigWithForm;
