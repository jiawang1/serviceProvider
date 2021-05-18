import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import Fab from '@material-ui/core/Fab';
import SaveIcon from '@material-ui/icons/Save';
import { TabPanel } from '../../components/tab-panel/TabPanel';
import { Page } from '../../components/page/Page';
import { ServiceList } from '../service-list/ServiceList';
import { getProjectDetail, getCacheStrateList, CacheStrategy, Protocol, saveProjectConfig } from './detailService';
import './style.css';

const a11yProps = (index: any) => {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`
  };
};

export const ProjectDetail = ({ projectActive = false }) => {
  const [value, setValue] = useState(0);
  const [projectName, setProjectName] = useState<string>();
  const [active, setActive] = useState(projectActive);
  const [servicePort, setServicePort] = useState<string>();
  const [serviceProtocol, setServiceProtocol] = useState<Protocol>('HTTP');
  const [TLSCert, setTLSCert] = useState<string>();
  const [TLSKey, setTLSKey] = useState<string>();
  const [automaticalSync, setAutomaticalSync] = useState<boolean>(false);
  const [remoteServiceProtocol, setRemoteServiceProtocol] = useState<Protocol>('HTTP');
  const [remoteServiceHost, setRemoteServiceHost] = useState<string>();
  const [remoteServicePort, setRemoteServicePort] = useState<string>();
  const [localResourceRoute, setLocalResourceRoute] = useState<string>();
  const [localResourceRoot, setLocalResourceRoot] = useState<string>();
  const [cacheStrategy, setCacheStrategy] = useState(0);
  const [cacheStrategyList, setCacheStrategyList] = useState<CacheStrategy[]>([]);
  const location = useLocation();

  useEffect(() => {
    const params = decodeURIComponent(location.search.slice(1).split('=')[1]);

    getCacheStrateList().then(list => {
      setCacheStrategyList(list);
    });
    getProjectDetail(params)
      .then(data => {
        setProjectName(data.projectName);
        setServicePort(data.servicePort);
        setActive(!!data.active);
        setCacheStrategy(data.cacheStrategy);
        setServiceProtocol(data.serviceProtocol || 'HTTP');
        setTLSCert(data.TLSCert);
        setTLSKey(data.TLSKey);
        setAutomaticalSync(!!data.automaticalSync);
        setRemoteServiceProtocol(data.remoteServiceProtocol || 'HTTP');
        setRemoteServiceHost(data.remoteServiceHost);
        setRemoteServicePort(data.remoteServicePort);
        setLocalResourceRoute(data.localResourceRoute);
        setLocalResourceRoot(data.localResourceRoot);
      })
      .catch(e => console.error(e));
  }, []);

  const handleSelection = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleSelectCache = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCacheStrategy(event.target.value as string);
  };

  const handleSaveConfig = () => {
    const projectId = decodeURIComponent(location.search.slice(1).split('=')[1]);
    saveProjectConfig({
      projectId,
      projectName,
      servicePort,
      cacheStrategy,
      active,
      serviceProtocol,
      TLSCert,
      TLSKey,
      automaticalSync,
      remoteServiceProtocol,
      remoteServiceHost,
      remoteServicePort,
      localResourceRoute,
      localResourceRoot
    }).catch(e => console.error(e));
  };

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
              {projectName ? (
                <>
                  <div className="px-element-box">
                    <TextField label="Project Name" variant="outlined" fullWidth disabled value={projectName} />
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
                    <TextField
                      label="Port"
                      variant="outlined"
                      fullWidth
                      value={servicePort}
                      onChange={event => {
                        setServicePort(event.target.value);
                      }}
                    />
                  </div>

                  <div className="px-element-box">
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Protocol</FormLabel>
                      <RadioGroup
                        row
                        aria-label="position"
                        name="position"
                        value={serviceProtocol}
                        defaultValue={serviceProtocol}
                        onChange={event => {
                          setServiceProtocol(event.target.value);
                        }}
                      >
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
                    <TextField
                      label="TLS cert"
                      variant="outlined"
                      fullWidth
                      value={TLSCert}
                      onChange={event => {
                        setTLSCert(event.target.value);
                      }}
                    />
                  </div>

                  <div className="px-element-box">
                    <TextField
                      label="TLS key"
                      variant="outlined"
                      fullWidth
                      value={TLSKey}
                      onChange={event => {
                        setTLSKey(event.target.value);
                      }}
                    />
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card raised className="px-multi-card">
            <CardContent>
              <Typography variant="h5" component="h2">
                Proxy To End Point Server
              </Typography>
              {projectName ? (
                <>
                  <div className="px-element-box">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={automaticalSync}
                          onChange={() => {
                            setAutomaticalSync(!automaticalSync);
                          }}
                          name="automaticalSync"
                          color="primary"
                        />
                      }
                      label="Sync to local cache"
                      labelPlacement="top"
                    />
                  </div>
                  <div className="px-element-box">
                    <FormControl component="fieldset">
                      <FormLabel component="legend">End Point Protoco</FormLabel>
                      <RadioGroup
                        row
                        aria-label="position"
                        name="position"
                        value={remoteServiceProtocol}
                        onChange={event => {
                          setRemoteServiceProtocol(event.target.value);
                        }}
                      >
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
                    <TextField
                      label="End Point Host"
                      variant="outlined"
                      fullWidth
                      value={remoteServiceHost}
                      onChange={event => {
                        setRemoteServiceHost(event.target.value);
                      }}
                    />
                  </div>

                  <div className="px-element-box">
                    <TextField
                      label="End Point Port"
                      variant="outlined"
                      fullWidth
                      value={remoteServicePort}
                      onChange={event => {
                        setRemoteServicePort(event.target.value);
                      }}
                    />
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
                        {cacheStrategyList.map(strategy => {
                          return (
                            <MenuItem value={strategy.key} key={strategy.key}>
                              {strategy.text}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card raised className="px-multi-card">
            <CardContent>
              <Typography variant="h5" component="h2">
                Reverse Proxy
              </Typography>
              {projectName ? (
                <>
                  <div className="px-element-box">
                    <TextField
                      label="Local Resource Route"
                      variant="outlined"
                      fullWidth
                      value={localResourceRoute}
                      onChange={event => {
                        setLocalResourceRoute(event.target.value);
                      }}
                    />
                  </div>
                  <div className="px-element-box">
                    <TextField
                      label="Resource Root"
                      variant="outlined"
                      fullWidth
                      value={localResourceRoot}
                      onChange={event => {
                        setLocalResourceRoot(event.target.value);
                      }}
                    />
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ServiceList />
        </TabPanel>
      </div>
      {value === 0 && (
        <Fab color="primary" aria-label="add" className="px-fix-create" onClick={handleSaveConfig}>
          <SaveIcon />
        </Fab>
      )}
    </Page>
  );
};
