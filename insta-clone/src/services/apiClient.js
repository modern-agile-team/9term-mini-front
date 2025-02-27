import ky from 'ky';

const apiClient = ky.create({
  // prefixUrl: 'http://api.modonggu.site/', // ✅ 백엔드 API 주소
  prefixUrl: 'http://43.202.196.220:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // ✅ 세션 쿠키 포함 (withCredentials 대체)
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          console.error('인증 오류: 로그인 필요');
          window.location.href = '/login'; // 🚀 401 발생 시 자동 로그인 페이지 이동
        }
      },
    ],
  },
});

export default apiClient;
