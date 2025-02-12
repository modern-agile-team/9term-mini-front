import { http, HttpResponse } from 'msw';

let posts = [
  {
    id: 1,
    username: 'user1_1',
    image:
      'https://cdn.news.hidoc.co.kr/news/photo/202104/24409_58461_0826.jpg',
    caption: '여행왔슈',
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
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmMPQb8IJeXeHn_Fxj8HN19mDbRKEFCmCjwQ&s',
    caption: '냐옹이',
    likes: 5,
    createdAt: new Date().toISOString(),
    comments: [
      { id: 3, username: 'user1_1', text: '귀엽군', likes: 3 },
      { id: 4, username: 'user4', text: '이름이 뭐야옹?', likes: 0 },
    ],
  },
];

let users = [
  {
    email: '123@gmail.com',
    username: '123',
    password: 'password123',
  },
];

// ✅ 로그인된 유저를 LocalStorage에 저장하여 유지
const getLoggedInUser = () => {
  const savedUser = localStorage.getItem('loggedInUser');
  return savedUser ? JSON.parse(savedUser) : null;
};

const setLoggedInUser = user => {
  localStorage.setItem('loggedInUser', JSON.stringify(user));
};

const removeLoggedInUser = () => {
  localStorage.removeItem('loggedInUser');
};

export const handlers = [
  // ✅ 현재 로그인된 사용자 정보 조회
  http.get('/api/user', async () => {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      email: loggedInUser.email,
      username: loggedInUser.username,
    });
  }),

  // ✅ 회원가입 (이메일 기반)
  http.post('/api/signup', async ({ request }) => {
    const { email, password } = await request.json();

    if (!email.includes('@') || !email.includes('.')) {
      return HttpResponse.json(
        { error: '유효한 이메일을 입력하세요.' },
        { status: 400 }
      );
    }

    if (users.some(user => user.email === email)) {
      return HttpResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 409 }
      );
    }

    const username = email.split('@')[0];
    const newUser = { email, username, password };
    users.push(newUser);

    console.log('✅ 회원가입 성공:', newUser);
    return HttpResponse.json(
      { message: '회원가입 성공', user: newUser },
      { status: 201 }
    );
  }),

  // ✅ 로그인 (이메일 기반)
  http.post('/api/login', async ({ request }) => {
    const { email, password } = await request.json();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return HttpResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    setLoggedInUser(user);
    console.log('✅ 로그인 성공:', user);

    return HttpResponse.json({ message: '로그인 성공', user });
  }),

  // ✅ 로그아웃
  http.delete('/api/logout', async () => {
    removeLoggedInUser();
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
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const newPost = await request.json();
    newPost.id = posts.length + 1;
    newPost.likes = 0;
    newPost.comments = [];
    newPost.createdAt = new Date().toISOString();
    newPost.username = loggedInUser.username;

    posts.push(newPost);
    return HttpResponse.json(newPost, { status: 201 });
  }),

  // ✅ 게시물 수정 (PATCH)
  http.patch('/api/posts/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json();
    const postIndex = posts.findIndex(post => post.id === Number(id));

    if (postIndex === -1) {
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    posts[postIndex] = { ...posts[postIndex], ...updateData };
    return HttpResponse.json(posts[postIndex]);
  }),

  // ✅ 게시물 삭제 (DELETE)
  http.delete('/api/posts/:id', async ({ params }) => {
    const { id } = params;
    const postIndex = posts.findIndex(post => post.id === Number(id));

    if (postIndex === -1) {
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    posts = posts.filter(post => post.id !== Number(id));
    return HttpResponse.json({ message: '게시물이 삭제되었습니다.' });
  }),

  // ✅ 게시물 좋아요 / 취소 (중복 방지)
  http.post('/api/posts/:id/like', async ({ params }) => {
    const { id } = params;
    const post = posts.find(post => post.id === Number(id));

    if (!post) {
      return HttpResponse.json({ error: '게시물 없음' }, { status: 404 });
    }

    post.likes = post.likes > 0 ? post.likes - 1 : post.likes + 1;
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
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const post = posts.find(post => post.id === Number(id));

    if (!post) {
      return HttpResponse.json({ error: '게시물 없음' }, { status: 404 });
    }

    const newComment = await request.json();
    newComment.id = Date.now();
    newComment.username = loggedInUser.username;
    newComment.likes = 0;

    post.comments.push(newComment);
    return HttpResponse.json(newComment, { status: 201 });
  }),

  // ✅ 댓글 좋아요 기능 추가
  http.post('/api/comments/:id/like', async ({ params }) => {
    const { id } = params;
    let commentFound = false;

    posts.forEach(post => {
      post.comments.forEach(comment => {
        if (comment.id === Number(id)) {
          comment.likes += 1;
          commentFound = true;
        }
      });
    });

    if (!commentFound) {
      return HttpResponse.json({ error: '댓글 없음' }, { status: 404 });
    }

    return HttpResponse.json({ message: '댓글 좋아요 성공' });
  }),
];
