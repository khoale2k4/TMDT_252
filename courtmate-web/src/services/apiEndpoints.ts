export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    STATS: '/users/me/stats',
    ACTIVITIES: '/users/me/activities',
  },
  CHECKOUTS: {
    CREATE: '/checkouts',
    RECURRING: '/checkouts/recurring',
    GET: (id: string) => `/checkouts/${id}`,
  },
  LOBBIES: {
    LIST: '/lobbies',
    CREATE: '/lobbies',
    JOIN: (id: string) => `/lobbies/${id}/join`,
  },
  VENUES: {
    LIST: '/venues',
    NEARBY: '/venues/nearby',
    DETAIL: (id: string) => `/venues/${id}`,
    SLOT: (id: string) => `/venues/${id}/slots`,
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
    PRICING_RULES: {
      LIST: '/admin/pricing-rules/test', // Từ PricingRulesController
      CREATE: '/admin/pricing-rules/new-rule',
      REFRESH: '/admin/pricing-rules/refresh-active-rules',
    },
    INVOICES: {
      LIST: '/admin/invoices',
      SYNC: (id: string) => `/admin/invoices/${id}/sync`,
    },
    REPORTS: {
      HEATMAP: '/admin/reports/heatmap',
    }
  },
};

export default API_ENDPOINTS;
