import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://your-api-url.com', // 백엔드 URL 설정
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
