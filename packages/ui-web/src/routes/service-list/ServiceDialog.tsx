import React, { useEffect, useState, useRef } from 'react';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { TransitionProps } from '@material-ui/core/transitions';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import SettingsIcon from '@material-ui/icons/Settings';
import PostAddIcon from '@material-ui/icons/PostAdd';
import * as monaco from 'monaco-editor';
import { FullScreenDialog } from '../../components/full-dialog/FullScreenDialog';
import { Protocol } from '../../common/type';
import { TabPanel } from '../../components/tab-panel/TabPanel';

import { JSONRenderer } from './JSONRenderer';

const a11yProps = (index: any) => {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`
  };
};

const tt = `{
              "test":1,
              "value":"a"
            }`;

const useJSONRender = (root, value) => {
  const rootContainer = useRef();
  const editorContainer = useRef<monaco.editor.IStandaloneCodeEditor>();

  if (rootContainer.current !== root) {
    if (root) {
      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&');
      editorContainer.current = monaco.editor.create(root, {
        value,
        language: 'json',
        theme: 'vs-dark'
      });
    }
  }
  useEffect(() => {
    rootContainer.current = root;
  });

  return [
    () => {
      if (editorContainer.current) {
        return editorContainer.current.getValue();
      }
      return null;
    },
    () => {
      if (editorContainer.current) {
        editorContainer.current.getModel()?.dispose();
      }
    }
  ];
};

export const ServiceDialog = ({ showDialog, handleClose, serviceInfo }) => {
  const [value, setValue] = useState(0);
  const responseSchemaContainer = useRef();
  const preContainer = useRef();
  const [method, setMethod] = useState<string>('GET');
  const [serviceURL, setServiceURL] = useState<string>();

  useEffect(() => {
    preContainer.current = responseSchemaContainer.current;
  }, [responseSchemaContainer.current]);

  const renderIDE = ele => {
    responseSchemaContainer.current = ele;
    if (responseSchemaContainer.current && responseSchemaContainer.current !== preContainer.current) {
      console.log('rendered ***************************');
      console.log(responseSchemaContainer.current.children.length);
      monaco.editor.create(responseSchemaContainer.current, {
        value: `{
          "test":1,
          "value":"a"
        }`,
        language: 'json',
        theme: 'vs-dark'
      });
    }
  };

  const handleSelection = (_: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  return (
    <FullScreenDialog showDialog={showDialog} handleClose={handleClose} title="Service Dialog">
      <Tabs
        value={value}
        onChange={handleSelection}
        variant="scrollable"
        scrollButtons="on"
        indicatorColor="primary"
        textColor="primary"
        aria-label="scrollable force tabs example"
      >
        <Tab
          label="Basic Information"
          icon={<SettingsIcon />}
          {...a11yProps(0)}
          className={`px-dialog-tab ${value === 0 ? 'px-dialog_active' : ''}`}
        />
        <Tab
          label="Mock Data"
          icon={<PostAddIcon />}
          {...a11yProps(1)}
          className={`px-dialog-tab ${value === 1 ? 'px-dialog_active' : ''}`}
        />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Card raised>
          <CardContent>
            <div className="px-element-box">
              <FormControl component="fieldset">
                <FormLabel component="legend">HTTP Method</FormLabel>
                <RadioGroup row aria-label="position" name="position" defaultValue="GET" value={method}>
                  <FormControlLabel
                    value="GET"
                    control={<Radio color="primary" />}
                    label="GET"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="POST"
                    control={<Radio color="primary" />}
                    label="POST"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="PUT"
                    control={<Radio color="primary" />}
                    label="PUT"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="DELETE"
                    control={<Radio color="primary" />}
                    label="DELETE"
                    labelPlacement="start"
                  />
                  <FormControlLabel
                    value="PATCH"
                    control={<Radio color="primary" />}
                    label="PATCH"
                    labelPlacement="start"
                  />
                </RadioGroup>
              </FormControl>
            </div>

            <div className="px-element-box">
              <TextField label="Service URL" required variant="outlined" fullWidth value={serviceURL} />
            </div>

            <div className="px-element-box">
              <TextField label="Request Body Schema" variant="outlined" fullWidth />
            </div>

            {/* <JSONRenderer value={tt} root={responseSchemaContainer.current} getValue={getCode => console.log(getCode())}> */}
            <div className="px-element-box" ref={renderIDE} style={{ height: 200 }}></div>
            {/* </JSONRenderer> */}

            <div className="px-element-box">
              <TextField label="Delay" variant="outlined" fullWidth />
            </div>
          </CardContent>
        </Card>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Card raised>
          <CardContent>
            <div className="px-element-box">
              <TextField label="Parameter" helperText="Incorrect entry." variant="outlined" fullWidth />
            </div>
            <div className="px-element-box">
              <TextField label="Request Body" variant="outlined" fullWidth />
            </div>
            <div className="px-element-box">
              <TextField label="Response Body" variant="outlined" fullWidth />
            </div>
          </CardContent>
        </Card>
      </TabPanel>
    </FullScreenDialog>
  );
};
