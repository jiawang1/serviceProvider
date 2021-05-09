import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SettingsIcon from '@material-ui/icons/Settings';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { TabPanel } from '../../components/tab-panel/TabPanel';
import { Page } from '../../components/page/Page';
import { ServiceList } from '../service-list/ServiceList';
import './style.css';

const a11yProps = (index: any) => {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`
  };
};

export const ProjectDetail = ({ projectActive = false }) => {
  const [value, setValue] = useState(0);
  const [active, setActive] = useState(projectActive);
  const [cacheStrategy, setCacheStrategy] = useState();

  const handleSelection = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleSelectCache = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCacheStrategy(event.target.value as string);
  };

  const handleCreateService = () => {};
  return (
    <Page>
      <div className="px-project-detail">
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
            label="Configuration"
            icon={<SettingsIcon />}
            {...a11yProps(0)}
            className={`px-dialog-tab ${value === 0 ? 'px-dialog_active' : ''}`}
          />
          <Tab
            label="Service List"
            icon={<FormatListBulletedIcon />}
            {...a11yProps(1)}
            className={`px-dialog-tab ${value === 1 ? 'px-dialog_active' : ''}`}
          />
        </Tabs>
        <TabPanel value={value} index={0}>
          <Card raised className="px-multi-card">
            <CardContent>
              <Typography variant="h5" component="h2">
                Basic confguration
              </Typography>
              <div className="px-element-box">
                <TextField label="Project Name" variant="outlined" fullWidth />
              </div>

              <div className="px-element-box">
                <FormControlLabel
                  control={
                    <Switch
                      checked={active}
                      onChange={() => {
                        setActive(!active);
                      }}
                      name="active"
                      color="primary"
                    />
                  }
                  label="Active"
                  labelPlacement="top"
                />
              </div>

              <div className="px-element-box">
                <TextField label="Port" variant="outlined" fullWidth defaultValue="3000" />
              </div>

              <div className="px-element-box">
                <FormControl component="fieldset">
                  <FormLabel component="legend">Protoco</FormLabel>
                  <RadioGroup row aria-label="position" name="position" defaultValue="HTTP">
                    <FormControlLabel
                      value="HTTP"
                      control={<Radio color="primary" />}
                      label="HTTP"
                      labelPlacement="start"
                    />
                    <FormControlLabel
                      value="HTTPS"
                      control={<Radio color="primary" />}
                      label="HTTPS"
                      labelPlacement="start"
                    />
                  </RadioGroup>
                </FormControl>
              </div>

              <div className="px-element-box">
                <TextField label="TLS cert" variant="outlined" fullWidth />
              </div>

              <div className="px-element-box">
                <TextField label="TLS key" variant="outlined" fullWidth />
              </div>
            </CardContent>
          </Card>

          <Card raised className="px-multi-card">
            <CardContent>
              <Typography variant="h5" component="h2">
                Proxy To End Point Server
              </Typography>

              <div className="px-element-box">
                <FormControl component="fieldset">
                  <FormLabel component="legend">End Point Protoco</FormLabel>
                  <RadioGroup row aria-label="position" name="position" defaultValue="HTTP">
                    <FormControlLabel
                      value="HTTP"
                      control={<Radio color="primary" />}
                      label="HTTP"
                      labelPlacement="start"
                    />
                    <FormControlLabel
                      value="HTTPS"
                      control={<Radio color="primary" />}
                      label="HTTPS"
                      labelPlacement="start"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
              <div className="px-element-box">
                <TextField label="End Point Host" variant="outlined" fullWidth />
              </div>

              <div className="px-element-box">
                <TextField label="End Point Port" variant="outlined" fullWidth />
              </div>
              <div className="px-element-box">
                <FormControl variant="outlined" className="px-full-select">
                  <InputLabel id="demo-simple-select-outlined-label">Cache Strategy</InputLabel>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={cacheStrategy}
                    onChange={handleSelectCache}
                    label="Cache Strategy"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </CardContent>
          </Card>

          <Card raised className="px-multi-card">
            <CardContent>
              <Typography variant="h5" component="h2">
                Reverse Proxy
              </Typography>

              <div className="px-element-box">
                <TextField label="Local Resource Route" variant="outlined" fullWidth />
              </div>

              <div className="px-element-box">
                <TextField label="Resource Root" variant="outlined" fullWidth />
              </div>
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ServiceList />
        </TabPanel>
      </div>
    </Page>
  );
};
