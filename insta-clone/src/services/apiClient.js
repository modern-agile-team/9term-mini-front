import ky from 'ky';

const apiClient = ky.create({
  prefixUrl: '', // 기본 URL 접두사는 비워둠 (Vite 프록시가 처리)
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // 쿠키를 자동으로 포함시킵니다
  timeout: 30000, // 30초 타임아웃 설정
  retry: {
    limit: 2, // 최대 2번 재시도
    methods: ['get'], // GET 요청만 재시도
  },
  hooks: {
    beforeRequest: [
      request => {
        // 필요한 경우 여기에 추가 헤더를 설정할 수 있습니다
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // 응답이 성공적이지 않은 경우에도 JSON 파싱 시도
        if (response.status === 404) {
          return response;
        }

        // 인증 오류 처리 (401)
        if (response.status === 401) {
          // 로그인 페이지가 아닌 경우에만 리디렉션
          if (window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
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
