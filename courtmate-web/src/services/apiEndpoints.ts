export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  VENUES: {
    LIST: '/venues',
    DETAILS: (id: string) => `/venues/${id}`,
    SEARCH: '/venues/search',
  },
  BOOKINGS: {
    CREATE: '/bookings',
    MY_BOOKINGS: '/bookings/me',
    DETAILS: (id: string) => `/bookings/${id}`,
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard/stats',
    VENUES: {
      LIST: '/admin/venues',
      CREATE: '/admin/venues',
      UPDATE: (id: string) => `/admin/venues/${id}`,
      DELETE: (id: string) => `/admin/venues/${id}`,
    },
    BOOKINGS: {
      LIST: '/admin/bookings',
      UPDATE_STATUS: (id: string) => `/admin/bookings/${id}/status`,
    },
  },
};

export default API_ENDPOINTS;
