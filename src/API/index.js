import {useEffect} from 'react'
import axios from 'axios'

// TODO: add some axios config/interceptors
axios.defaults.baseURL = 'http://120.78.71.214';

const methods = ['get', 'post'];

const createAPI = (method) => (url, params, config) => {
  const cfg = {url};
  method = (method && typeof method === 'string' && method.toLowerCase()) || 'get';
  method === 'get'? (cfg.params = params): (cfg.data = params);
  Object.assign(cfg, {method}, config || {});
  return axios(cfg);
}

const API = {};
methods.forEach((method) => {
  API[method] = createAPI(method);
});

export default API