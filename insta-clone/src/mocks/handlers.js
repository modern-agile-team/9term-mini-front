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

let users = [{ username: 'mockUser123', password: 'password123' }];
let loggedInUser = null;

export const handlers = [
  // ✅ 현재 로그인된 사용자 정보 API (기존 코드에서 빠져있던 부분 추가)
  http.get('/api/user', async () => {
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }
    return HttpResponse.json({ username: loggedInUser.username });
  }),

  // ✅ 회원가입
  http.post('/api/signup', async ({ request }) => {
    const newUser = await request.json();
    users.push(newUser);
    return HttpResponse.json({ message: '회원가입 성공' }, { status: 201 });
  }),

  // ✅ 로그인
  http.post('/api/login', async ({ request }) => {
    const { username, password } = await request.json();
    const user = users.find(
      u => u.username === username && u.password === password
    );
    if (!user) {
      return HttpResponse.json({ error: '로그인 실패' }, { status: 401 });
    }
    loggedInUser = user;
    return HttpResponse.json({ message: '로그인 성공', user });
  }),

  // ✅ 로그아웃
  http.delete('/api/logout', async () => {
    loggedInUser = null;
    return HttpResponse.json({ message: '로그아웃 성공' });
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

  // ✅ 게시물 추가
  http.post('/api/posts', async ({ request }) => {
    const newPost = await request.json();
    newPost.id = posts.length + 1;
    newPost.likes = 0;
    newPost.comments = [];
    posts.push(newPost);
    return HttpResponse.json(newPost, { status: 201 });
  }),

  // ✅ 게시물 수정
  http.patch('/api/posts/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedData = await request.json();
    const post = posts.find(post => post.id === Number(id));
    if (!post) {
      return HttpResponse.json({ error: '게시물 없음' }, { status: 404 });
    }
    Object.assign(post, updatedData);
    return HttpResponse.json(post);
  }),

  // ✅ 게시물 삭제
  http.delete('/api/posts/:id', async ({ params }) => {
    const { id } = params;
    posts = posts.filter(post => post.id !== Number(id));
    return HttpResponse.json({ message: '게시물 삭제 성공' });
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

  // ✅ 댓글 삭제
  http.delete('/api/comments/:id', async ({ params }) => {
    const { id } = params;
    posts.forEach(post => {
      post.comments = post.comments.filter(
        (comment, index) => index !== Number(id)
      );
    });
    return HttpResponse.json({ message: '댓글 삭제 성공' });
  }),

  // ✅ 댓글 좋아요 / 취소 (단순 예제, 좋아요 수 추가 가능)
  http.post('/api/comments/:id/like', async ({ params }) => {
    return HttpResponse.json({ message: '댓글 좋아요 / 취소 성공' });
  }),
];
