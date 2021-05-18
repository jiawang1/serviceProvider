import { CACHE_STRATEGY } from './util';

export type CacheStrategy = typeof CACHE_STRATEGY[keyof typeof CACHE_STRATEGY];

export type Protocol = 'HTTP' | 'HTTPS';

export interface ProjectConfiguration {
  projectId: string;
  projectName: string;
  active: boolean;
  servicePort: string;
  serviceProtocol: Protocol;
  TLSCert?: string;
  TLSKey?: string;
  cacheStrategy: CacheStrategy;
  automaticalSync: boolean;

  remoteServiceProtocol?: Protocol;
  remoteServiceHost?: string;
  remoteServicePort?: string;

  localResourceRoute?: string;
  localResourceRoot?: string;
}
