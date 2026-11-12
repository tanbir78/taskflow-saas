import axios from 'axios';
import { auth } from '../firebase/config';

// Create Axios instance
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
});

// Attach Firebase ID token to each request
api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Extract response data
export const unwrap = (p) => {
  return p.then((r) => r.data.data);
};
