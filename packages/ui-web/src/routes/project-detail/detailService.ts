import axios from 'axios';
import { Protocol } from '../../common/type';

export interface CacheStrategy {
  key: string;
  text: string;
}

export interface ProjectConfiguration {
  projectId: string;
  projectName: string;
  active: boolean;
  servicePort: string;
  serviceProtocol: Protocol;
  TLSCert?: string;
  TLSKey?: string;
  cacheStrategy: number;
  automaticalSync: boolean;

  remoteServiceProtocol?: Protocol;
  remoteServiceHost?: string;
  remoteServicePort?: string;

  localResourceRoute?: string;
  localResourceRoot?: string;
}

export const getProjectDetail: (id: string) => Promise<ProjectConfiguration> = id => {
  return axios.get(`/api/projects/${id}`).then(response => response.data);
};

export const getCacheStrateList: () => Promise<CacheStrategy[]> = () => {
  return axios.get(`/api/CacheStrategys`).then(response => response.data);
};

export const saveProjectConfig: (config: ProjectConfiguration) => Promise<ProjectConfiguration> = async config => {
  const { projectId } = config;
  return axios.put(`/api/projects/${projectId}`, { ...config });
};
