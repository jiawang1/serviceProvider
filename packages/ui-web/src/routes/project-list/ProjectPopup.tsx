import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

export interface ProjectPopupProps {
  open: boolean;
  onClose: () => void;
}

export const ProjectPopup: React.FC<ProjectPopupProps> = ({ open = false, onClose }) => {
  const handleCreate = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} className="px-dialog-create-project" maxWidth="lg" disableBackdropClick>
      <DialogTitle id="form-dialog-title">Create Project</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" id="name" label="Project Name" type="email" fullWidth variant="outlined" />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (onClose) {
              onClose();
            }
          }}
          color="primary"
        >
          Cancel
        </Button>
        <Button onClick={handleCreate} color="primary" variant="outlined">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
