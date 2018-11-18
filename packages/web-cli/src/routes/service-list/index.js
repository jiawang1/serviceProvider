import { Route } from 'react-router-dom';
import React from 'react';
import ServiceList from './ServiceList';

export default () => <Route path="/service-list" component={ServiceList} />;
