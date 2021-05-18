import React from 'react';
import { Route } from 'react-router-dom';
import { ProjectDetail } from './ProjectDetail';

const ProjectDetailRouts = () => {
  return <Route path="/project-detail" component={ProjectDetail} />;
};

export default ProjectDetailRouts;
