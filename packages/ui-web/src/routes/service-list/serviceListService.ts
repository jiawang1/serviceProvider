// import axios from 'axios';

export const HTTPMethod = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE',
  patch: 'PATCH'
} as const;

type Method = typeof HTTPMethod[keyof typeof HTTPMethod];

export type KV<T = string> = { [key in string]: T };

export interface Service {
  serviceURL: string;
  method: Method;
  param?: string;
  body?: KV<any>;
  response: object;
}

export const getServiceList: (projectId: string) => Promise<Array<Service>> = () => {
  return Promise.resolve([
    { serviceURL: '/test1', method: 'PUT', body: { id: 1 }, response: { data: { status: 1 } } },
    { serviceURL: '/test2', method: 'GET', param: 'key=1&name=2', response: { data: { status: 2 } } },
    { serviceURL: '/test3', method: 'POST', body: { id: 3 }, response: { data: { status: 4 } } },
    { serviceURL: '/test4', method: 'DELETE', body: { id: 1 }, response: { data: { status: 1 } } }
  ]);
  // return axios.get('/proxy-mock/projects');
};
