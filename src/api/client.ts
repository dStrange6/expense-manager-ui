import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Points to your Spring Boot app
  headers: {
    'Content-Type': 'application/json',
  },
});