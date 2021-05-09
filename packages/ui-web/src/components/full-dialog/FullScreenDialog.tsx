import React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { TransitionProps } from '@material-ui/core/transitions';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import './style.css';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const FullScreenDialog = ({ showDialog, handleClose, title, children }) => {
  return (
    <Dialog
      fullScreen
      open={showDialog}
      onClose={handleClose}
      TransitionComponent={Transition}
      className="px-service-dialog"
    >
      <AppBar className="px-app-bar">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">{title}</Typography>
          <Button autoFocus color="inherit" onClick={handleClose} className="px-service-save">
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <div style={{ marginTop: 88, marginLeft: 30, marginRight: 30 }}>{children}</div>
    </Dialog>
  );
};
