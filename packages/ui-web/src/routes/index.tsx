import React from 'react';
import ProjectListRouts from './project-list';
import ServiceList from './service-list';
import ProjectDetail from './project-detail';

const Routes = () => (
  <>
    <ProjectListRouts />
    <ProjectDetail />
    <ServiceList />
  </>
);

export default Routes;
