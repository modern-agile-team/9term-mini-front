import ky from 'ky';

const apiClient = ky.create({
  prefixUrl: 'http://43.202.196.220:3000/', // ✅ 백엔드 API 주소
  headers: () => {
    return {
      'Content-Type': 'application/json',
    };
  },
  credentials: 'include', // ✅ withCredentials 대체 (쿠키 인증 사용 시)
  hooks: {
    // ✅ 요청 전 인터셉터 (axios의 request.use 대체)
    beforeRequest: [
      request => {
        console.log('API 요청 전:', request);
      },
    ],
    // ✅ 응답 후 인터셉터 (axios의 response.use 대체)
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          console.error('인증 오류: 로그인 필요');
          // 🚀 로그아웃 처리 or 로그인 페이지 이동 로직 추가 가능
        }
      },
    ],
  },
});

export default apiClient;
