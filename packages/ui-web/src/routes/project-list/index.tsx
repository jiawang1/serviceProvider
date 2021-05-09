import React from 'react';
import { Route } from 'react-router-dom';
import { ProjectList } from './ProjectList';

const ProjectListRouts = () => {
  return <Route path="/project-list" component={ProjectList} />;
};

export default ProjectListRouts;
