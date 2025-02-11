// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

let posts = [
  {
    id: 1,
    username: 'user1_1',
    image:
      'https://cdn.news.hidoc.co.kr/news/photo/202104/24409_58461_0826.jpg',
    caption: '여행왔슈',
    likes: 10,
    comments: [
      { username: 'user2', text: '멋진 사진이네요!' },
      { username: 'user3', text: '어디로 여행 가셨나요?' },
    ],
  },
  {
    id: 2,
    username: 'user2',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmMPQb8IJeXeHn_Fxj8HN19mDbRKEFCmCjwQ&s',
    caption: '냐옹이',
    likes: 5,
    comments: [
      { username: 'user1_1', text: '귀엽군' },
      { username: 'user4', text: '이름이 뭐야옹?' },
    ],
  },
];

export const handlers = [
  // ✅ 현재 로그인된 사용자 정보 API
  http.get('/api/user', async () => {
    return HttpResponse.json({ username: 'mockUser123' });
  }),

  // ✅ 게시물 조회 (페이징 지원)
  http.get('/api/posts', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const perPage = 2; // 한 페이지당 2개 게시물 제공
    const startIndex = (page - 1) * perPage;
    const paginatedPosts = posts.slice(startIndex, startIndex + perPage);

    return HttpResponse.json(paginatedPosts);
  }),

  // ✅ 게시물 추가
  http.post('/api/posts', async ({ request }) => {
    const newPost = await request.json();
    newPost.id = posts.length + 1;
    newPost.likes = 0;
    newPost.comments = [];
    posts.push(newPost);
    return HttpResponse.json(newPost, { status: 201 });
  }),

  // ✅ 게시물 좋아요 / 취소
  http.post('/api/posts/:id/like', async ({ params }) => {
    const { id } = params;
    const post = posts.find(post => post.id === Number(id));

    if (!post) {
      return HttpResponse.json({ error: '게시물 없음' }, { status: 404 });
    }

    post.likes += 1;
    return HttpResponse.json(post);
  }),

  // ✅ 특정 게시물의 댓글 조회
  http.get('/api/posts/:id/comments', async ({ params }) => {
    const { id } = params;
    const post = posts.find(post => post.id === Number(id));

    if (!post) {
      return HttpResponse.json({ error: '게시물 없음' }, { status: 404 });
    }

    return HttpResponse.json(post.comments);
  }),

  // ✅ 댓글 추가
  http.post('/api/posts/:id/comments', async ({ params, request }) => {
    const { id } = params;
    const post = posts.find(post => post.id === Number(id));

    if (!post) {
      return HttpResponse.json({ error: '게시물 없음' }, { status: 404 });
    }

    const newComment = await request.json();
    post.comments.push(newComment);
    return HttpResponse.json(newComment, { status: 201 });
  }),
];
