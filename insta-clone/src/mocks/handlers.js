// src/mocks/handlers.js
import { http, HttpResponse } from 'msw'; // rest 대신 http 사용

export const handlers = [
  http.get('/api/posts', () => {
    return HttpResponse.json([
      { id: 1, username: 'user1', content: '하이' },
      { id: 2, username: 'user2', content: '안녕' },
    ]);
  }),

  http.post('/api/login', () => {
    return HttpResponse.json({ token: 'mocked_token' });
  }),
];
