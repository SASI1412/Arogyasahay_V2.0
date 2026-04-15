// API configuration file

// Set the backend URL based on the environment
const backendURL = process.env.NODE_ENV === 'production'
    ? 'https://your-production-url.com'
    : 'http://localhost:5000';

export const apiConfig = {
    backendURL,
    // other API configurations can go here
};
