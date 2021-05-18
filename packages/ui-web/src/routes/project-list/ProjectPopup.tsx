import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { createProject } from './projectService';

export interface ProjectPopupProps {
  open: boolean;
  onClose: (data?: Array<any>) => void;
}

const mandatoryMessage = 'Please supply project name';

export const ProjectPopup: React.FC<ProjectPopupProps> = ({ open = false, onClose }) => {
  const [name, setName] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleCreate = () => {
    if (name === null) {
      setShowError(true);
      return;
    }
    createProject(name).then(({ data }) => {
      if (onClose) {
        onClose(data);
      }
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (showError && event.target.value && event.target.value.length > 0) {
      setShowError(false);
    }
    setName(event.target.value);
  };

  return (
    <Dialog open={open} className="px-dialog-create-project" maxWidth="lg" disableBackdropClick>
      <DialogTitle id="form-dialog-title">Create Project</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          required
          margin="dense"
          id="name"
          label="Project Name"
          name="projectName"
          fullWidth
          variant="outlined"
          error={showError}
          helperText={showError ? mandatoryMessage : ''}
          onChange={handleChange}
        />
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
