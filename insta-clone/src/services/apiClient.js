import ky from 'ky';

const apiClient = ky.create({
  prefixUrl: '', // 기본 URL 접두사는 비워둠 (Vite 프록시가 처리)
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  timeout: 30000, // 30초 타임아웃 설정
  retry: {
    limit: 2, // 최대 2번 재시도
    methods: ['get'], // GET 요청만 재시도
  },
  hooks: {
    beforeRequest: [
      request => {
        const token = sessionStorage.getItem('token'); // ✅ 토큰 가져오기
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // 응답이 성공적이지 않은 경우에도 JSON 파싱 시도
        if (response.status === 404) {
          return response;
        }

        try {
          // 응답이 JSON인지 확인
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            if (response.ok) {
              const resJson = await response.json();
              return resJson.data || resJson;
            }
          }
          return response;
        } catch (error) {
          return response;
        }
      },
    ],
  },
});

export default apiClient;
