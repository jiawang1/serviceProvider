import React from 'react';
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
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import SettingsIcon from '@material-ui/icons/Settings';
import PostAddIcon from '@material-ui/icons/PostAdd';
import { TransitionProps } from '@material-ui/core/transitions';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import { FullScreenDialog } from '../../components/full-dialog/FullScreenDialog';

export interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({ open = false, onClose }) => {
  const handleCreate = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <FullScreenDialog showDialog={open} handleClose={onClose} title="Project Dialog">
      <Card raised>
        <CardContent>
          <div className="px-element-box">
            <TextField label="Project Name" variant="outlined" fullWidth />
          </div>
          <div className="px-element-box">
            <TextField label="Request Body" variant="outlined" fullWidth />
          </div>
          <div className="px-element-box">
            <TextField label="Response Body" variant="outlined" fullWidth />
          </div>
        </CardContent>
      </Card>
    </FullScreenDialog>
  );
};
