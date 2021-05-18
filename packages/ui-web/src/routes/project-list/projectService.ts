import axios from 'axios';
import { fetch } from '../../common/fetch';

export interface Project {
  projectName: string;
  projectId: string;
}

export const getProjectList: () => Promise<Array<Project>> = () => {
  return axios.get('/api/projects').then(response => response.data);
};

export const createProject = (projectName: string) => {
  return axios.post('/api/projects', { projectName });
};
