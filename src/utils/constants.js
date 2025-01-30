export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const ENDPOINTS = {
  LOGIN: '/auth/login',
  FETCH_USERS: '/users',
  FETCH_PROFILE: '/profile',
};

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
};
