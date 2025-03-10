import ky from 'ky';

const apiClient = ky.create({
  prefixUrl: '',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
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
        if (response.status === 401) {
          console.error('❌ 인증 오류: 로그인 필요');
        }
        if (response.ok) {
          const resJson = await response.json();
          return resJson.data || resJson;
        }
        return response;
      },
    ],
  },
});

export default apiClient;
