import axios from 'axios';

export interface Project {
  projectName: string;
  projectId: string;
}

export const getProjectList: () => Promise<Array<Project>> = () => {
  return Promise.resolve([
    { projectName: 'test1', projectId: 'test1' },
    { projectName: 'test2', projectId: 'test2' },
    { projectName: 'test3', projectId: 'test3' },
    { projectName: 'test4', projectId: 'test4' },
    { projectName: 'test5', projectId: 'test5' },
    { projectName: 'test6', projectId: 'test6' },
    { projectName: 'test7', projectId: 'test7' },
    { projectName: 'test8', projectId: 'test8' }
  ]);
  // return axios.get('/proxy-mock/projects');
};

export const createProject = (projectName: string) => {
  return axios.post('/proxy-mock/project', { projectName });
};
