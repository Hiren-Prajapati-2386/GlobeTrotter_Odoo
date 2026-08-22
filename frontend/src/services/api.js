import axios from 'axios';

// Create an instance connecting to our local FastAPI server
const api = axios.create({
    baseURL: 'http://localhost:8000',
});

// Automatically attach the JWT token if the user is logged in
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;