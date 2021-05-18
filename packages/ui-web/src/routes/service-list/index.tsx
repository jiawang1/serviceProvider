import React from 'react';
import { Route } from 'react-router-dom';
import { ServiceList } from './ServiceList';

const ServiceListRouts = () => {
  return <Route path="/service-list" component={ServiceList} />;
};

export default ServiceListRouts;
