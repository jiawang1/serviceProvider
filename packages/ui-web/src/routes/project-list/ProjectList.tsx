import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
// import DeleteIcon from '@material-ui/icons/Delete';
import Typography from '@material-ui/core/Typography';
import { getProjectList, Project } from './projectService';
import { ProjectPopup } from './ProjectPopup';
import { Page } from '../../components/page/Page';
import './style.css';

export const ProjectList: React.FC = () => {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const history = useHistory();
  useEffect(() => {
    getProjectList().then(data => {
      setProjectList(data);
    });
  }, []);

  const handleCreateProject = () => setShowCreateProject(true);

  const handleCreateCallback = data => {
    setShowCreateProject(false);
    if (data) {
      setProjectList(data);
    }
  };

  return (
    <Page
      actions={[
        <Button size="large" variant="contained" className="px-button-create" onClick={handleCreateProject}>
          Create Project
        </Button>
      ]}
    >
      <>
        <ProjectPopup open={showCreateProject} onClose={handleCreateCallback} />
        {projectList.map(project => {
          return (
            <Card
              key={project.projectId}
              className="px-card"
              onClick={() => {
                history.push(`/project-detail?id=${encodeURIComponent(project.projectId)}`);
              }}
            >
              <CardHeader title={project.projectName} />
              <CardContent>
                <Typography className="" color="textSecondary" gutterBottom>
                  Word of the Day
                </Typography>

                <Typography className="" color="textSecondary">
                  adjective
                </Typography>
                <Typography variant="body2" component="p">
                  well meaning and kindly.
                  <br />
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          );
        })}
      </>
    </Page>
  );
};
