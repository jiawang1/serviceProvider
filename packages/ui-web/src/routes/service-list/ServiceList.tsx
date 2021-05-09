import React, { useEffect, useState, useRef } from 'react';
import Paper from '@material-ui/core/Paper';
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
import Typography from '@material-ui/core/Typography';
import { TransitionProps } from '@material-ui/core/transitions';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { Page } from '../../components/page/Page';
import { getServiceList, Service } from './serviceListService';
import { ServiceDialog } from './ServiceDialog';
import './style.css';

export const ServiceList = () => {
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const handleClose = () => {
    setShowDialog(false);
  };

  useEffect(() => {
    getServiceList('').then(data => {
      setServiceList(data);
    });
  }, []);

  const Transition = useRef(
    React.forwardRef(function Transition(
      props: TransitionProps & { children?: React.ReactElement },
      ref: React.Ref<unknown>
    ) {
      return <Slide direction="up" ref={ref} {...props} />;
    })
  );

  const handleCreateService = () => {
    console.log('create ... . ....');
    setShowDialog(true);
  };

  const handeEditService = (service: Service) => {
    setShowDialog(true);
    console.log(service);
  };

  const handleDelete = (serviceURL: Service) => {
    console.log(serviceURL);
  };

  return (
    <>
      <Paper elevation={3} className="px-service-list">
        <List component="nav">
          {serviceList.map(service => {
            return (
              <ListItem key={service.serviceURL}>
                <div style={{ width: 80 }}>
                  <Chip label={service.method} color="primary" />
                </div>
                <ListItemText primary={service.serviceURL} className="px-service-item" />

                <IconButton edge="end" onClick={() => handeEditService(service)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(service)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>
      <Fab color="primary" aria-label="add" className="px-fix-create" onClick={handleCreateService}>
        <AddIcon />
      </Fab>
      <ServiceDialog showDialog={showDialog} handleClose={handleClose} />
    </>
  );
};
