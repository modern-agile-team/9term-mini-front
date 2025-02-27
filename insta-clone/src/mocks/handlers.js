import { http, HttpResponse } from 'msw';

let posts = [
  {
    id: 1,
    username: 'user1_1',
    postImg:
      'https://cdn.news.hidoc.co.kr/news/photo/202104/24409_58461_0826.jpg',
    content: '여행왔슈',
    likes: 10,
    createdAt: new Date().toISOString(),
    comments: [
      { id: 1, username: 'user2', text: '멋진 사진이네요!', likes: 2 },
      { id: 2, username: 'user3', text: '어디로 여행 가셨나요?', likes: 1 },
    ],
  },
  {
    id: 2,
    username: 'user2',
    postImg:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmMPQb8IJeXeHn_Fxj8HN19mDbRKEFCmCjwQ&s',
    content: '냐옹이',
    likes: 5,
    createdAt: new Date().toISOString(),
    comments: [
      { id: 3, username: 'user1_1', text: '귀엽군', likes: 3 },
      { id: 4, username: 'user4', text: '이름이 뭐야옹?', likes: 0 },
    ],
  },
];

const getSessionUser = () => {
  const session = sessionStorage.getItem('sessionUser');
  if (session) return JSON.parse(session);
  return null;
};

export const handlers = [
  // ✅ 현재 로그인한 사용자 정보 (`GET /api/users/me`)
  http.get('/api/users/me', async () => {
    const loggedInUser = getSessionUser();
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    return HttpResponse.json(loggedInUser);
  }),

  // ✅ 로그아웃 (`POST /api/logout`)
  http.post('/api/logout', async () => {
    sessionStorage.removeItem('sessionUser');
    return HttpResponse.json({ success: true, msg: '로그아웃 성공' });
  }),

  // ✅ 게시물 조회 (페이징 지원)
  http.get('/api/posts', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const perPage = 2;
    const startIndex = (page - 1) * perPage;
    const paginatedPosts = posts.slice(startIndex, startIndex + perPage);
    return HttpResponse.json(paginatedPosts);
  }),
];
