import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://43.202.196.220:3000/', // ✅ 백엔드 API 주소
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ 쿠키 기반 인증 사용 시 필요 (세션 유지)
});

// ✅ 요청 인터셉터 (API 요청 전 실행)
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token'); // ✅ JWT 토큰 저장 확인
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ 헤더에 토큰 추가
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// ✅ 응답 인터셉터 (API 응답 후 실행)
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error('인증 오류: 로그인 필요');
      // 🚀 로그아웃 처리 or 로그인 페이지로 이동
    }
    return Promise.reject(error);
  }
);

export default apiClient;
