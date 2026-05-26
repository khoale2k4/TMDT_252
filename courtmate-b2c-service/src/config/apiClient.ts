import axios from 'axios';
import axiosRetry from 'axios-retry';

// Create an axios instance for B2C service to call external APIs (e.g., Momo, ZaloPay, Webhooks)
const apiClient = axios.create({
  timeout: 5000,
});

// Configure retry and circuit breaker logic
axiosRetry(apiClient, { 
  retries: 3, // Retry up to 3 times
  retryDelay: (retryCount) => {
    console.warn(`Retry attempt: ${retryCount}`);
    return retryCount * 1000; // time interval between retries
  },
  retryCondition: (error) => {
    // Retry only on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ? error.response.status >= 500 : false);
  }
});

export default apiClient;
