// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  // 🔹 게시물 목록 API (Mock 데이터)
  http.get('/api/posts', () => {
    return HttpResponse.json([
      { id: 1, username: 'user1', content: '하이' },
      { id: 2, username: 'user2', content: '안녕' },
    ]);
  }),

  // 🔹 로그인 API (Mock)
  http.post('/api/login', () => {
    return HttpResponse.json({ token: 'mocked_token' });
  }),

  // 🔹 현재 로그인된 사용자 정보 API 추가
  http.get('/api/user', () => {
    return HttpResponse.json({ username: 'mockUser123' }); // 로그인된 사용자 이름 반환
  }),
];
