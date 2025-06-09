import axios from 'axios';

const getTokens = () => {
  return {
    jwt: sessionStorage.getItem('jwt') || '',
    jwtRefresh: sessionStorage.getItem('jwtRefresh') || '',
  };
};

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const { jwt, jwtRefresh } = getTokens();

      if (jwt) {
        config.headers['auth_jwt'] = jwt;
      }

      if (jwtRefresh) {
        config.headers['auth_jwt_refresh'] = jwtRefresh;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

export const axiosInstance = createAxiosInstance(import.meta.env.VITE_BASE_URL);
export const axiosAuthInstance = createAxiosInstance(import.meta.env.VITE_AUTH_API);
