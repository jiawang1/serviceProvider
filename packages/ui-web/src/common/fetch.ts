import axios from 'axios';

export const apiHost = process.env.APP_SERVICE_HOST;

console.log(apiHost, '*********');

const axiosCreate = options => {
  const defaultConfig = {
    baseURL: apiHost,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    responseType: 'json',
    timeout: 10000,
    validateStatus: (status: number) => status >= 200 && status < 300,
    showGlobalLoading: false
  };
  const fetch = axios.create({
    ...defaultConfig,
    ...options
  });

  // fetch.interceptors.request.use(config => {
  //   const { showGlobalLoading, headers } = config;
  //   if (showGlobalLoading) {
  //     see.emit(`${EVENT_NAMESPACE}/globalLoading`, true);
  //   }
  //   const token = localStorage.getItem('token');
  //   const registerCenter = localStorage.getItem('registerCenter');
  //   if (token) {
  //     headers.token = token;
  //   }
  //   if (registerCenter) {
  //     headers.registerSource = registerCenter;
  //   }

  //   return config;
  // });

  // fetch.interceptors.response.use(
  //   response => {
  //     const { showGlobalLoading } = response.config;
  //     if (showGlobalLoading) {
  //       see.emit(`${EVENT_NAMESPACE}/globalLoading`, false);
  //     }
  //     return Promise.resolve(response);
  //   },
  //   error => {
  //     const { response } = error;
  //     const { showGlobalLoading } = error.config;
  //     if (showGlobalLoading) {
  //       see.emit(`${EVENT_NAMESPACE}/globalLoading`, false);
  //     }

  //     if ((response && response.status === 408) || error.code === 'ECONNABORTED') {
  //       const timeoutError = 'Request to backend service timeout, Please retry later';
  //       console.error(`request to ${error.config ? error.config.url : ' '}timeout`, error.message);

  //       if (!error.config || !error.config.ignoreExceptionHandler) {
  //         renderMessage(timeoutError);
  //       }

  //       const newError = {
  //         httpMessage: error.message,
  //         code: error.code,
  //         msgContent: timeoutError,
  //         originlaError: error,
  //         status: 408
  //       };
  //       return Promise.reject(newError);
  //     }

  //     if (response && response.status) {
  //       let msgContent = null;

  //       if (response.data) {
  //         if (response.data.msgContent) {
  //           msgContent = response.data.msgContent;
  //         } else if (error.response.data.status === 403) {
  //           msgContent = 'You do not have enough permission, will redict current page to request futher permission';
  //         }
  //       }
  //       msgContent = msgContent || 'Failed to connect to backend service, please contact with admin';

  //       const newError = {
  //         httpMessage: error.message,
  //         code: response.data ? response.data.code : response.status,
  //         msgContent,
  //         originlaError: error,
  //         msgCode: response.data ? response.data.msgCode : null,
  //         status: response.status
  //       };
  //       console.error(newError.msgContent, error.config ? error.config.url : '');

  //       if (!error.config || !error.config.ignoreExceptionHandler) {
  //         renderMessage(newError.msgContent);
  //       }
  //       return Promise.reject(newError);
  //     }

  //     console.error(error);
  //     return Promise.reject(error);
  //   }
  // );

  // @ts-ignore
  return fetch;
};

const fetch = axiosCreate({});

export { fetch };
export default axiosCreate;
