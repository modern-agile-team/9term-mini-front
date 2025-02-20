import { http, HttpResponse } from 'msw';

let users = [
  {
    email: '123@gmail.com',
    username: '123',
    password: 'password123',
  },
];
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

// ✅ SHA-256 해싱 함수 (bcrypt 대체)
const hashPassword = async password => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

const getSessionUser = () => {
  const session = sessionStorage.getItem('sessionUser');
  if (session) return JSON.parse(session);

  // ✅ 기본 로그인 유저 설정 (디버깅용)
  const defaultUser = { email: '123@gmail.com', username: '123' };
  sessionStorage.setItem('sessionUser', JSON.stringify(defaultUser));
  return defaultUser;
};

const setSessionUser = user => {
  sessionStorage.setItem('sessionUser', JSON.stringify(user));
};

const clearSessionUser = () => {
  sessionStorage.removeItem('sessionUser');
};

export const handlers = [
  // ✅ 회원가입 (`POST /api/register`)
  http.post('/api/register', async ({ request }) => {
    const { email, pwd, profile_image } = await request.json();

    if (!email.includes('@') || !email.includes('.')) {
      return HttpResponse.json(
        { success: false, msg: '유효한 이메일을 입력하세요.' },
        { status: 400 }
      );
    }

    if (users.some(user => user.email === email)) {
      return HttpResponse.json(
        { success: false, msg: '이미 존재하는 이메일입니다.' },
        { status: 409 }
      );
    }

    // ✅ SHA-256으로 비밀번호 해싱
    const hashedPwd = await hashPassword(pwd);
    const newUser = { email, pwd: hashedPwd, profile_image };

    users.push(newUser);
    return HttpResponse.json(
      { success: true, msg: '회원가입이 완료되었습니다.' },
      { status: 201 }
    );
  }),

  // ✅ 로그인 (`POST /api/login`)
  http.post('/api/login', async ({ request }) => {
    const { email, pwd } = await request.json();

    const user = users.find(u => u.email === email);
    if (!user) {
      return HttpResponse.json(
        { success: false, msg: '존재하지 않는 이메일입니다.' },
        { status: 401 }
      );
    }

    // ✅ 비밀번호 비교 (SHA-256 해싱 후 비교)
    const hashedPwd = await hashPassword(pwd);
    if (hashedPwd !== user.pwd) {
      return HttpResponse.json(
        { success: false, msg: '비밀번호를 다시 입력해주세요.' },
        { status: 401 }
      );
    }

    setSessionUser(user);
    return HttpResponse.json({ success: true, email: user.email });
  }),

  // ✅ 로그아웃 (`POST /api/logout`)
  http.post('/api/logout', async () => {
    clearSessionUser();
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

  // ✅ 게시물 추가
  http.post('/api/posts', async ({ request }) => {
    const loggedInUser = getSessionUser();
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
    const loggedInUser = getSessionUser();
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
  // ✅ 프로필 이미지 업로드
http.post('/api/profile/image', async ({ request }) => {
  const loggedInUser = getSessionUser();
  if (!loggedInUser) {
    return HttpResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const { image } = await request.json();
    
    // 현재 로그인한 유저의 프로필 이미지 업데이트
    const user = users.find(u => u.email === loggedInUser.email);
    if (user) {
      user.profile_image = image;
      
      // 세션 유저 정보도 업데이트
      setSessionUser({
        ...loggedInUser,
        profile_image: image
      });
    }

    return HttpResponse.json({ 
      success: true,
      message: '프로필 이미지가 업데이트되었습니다.',
      image
    });
  } catch (error) {
    return HttpResponse.json(
      { error: '이미지 업로드 실패' },
      { status: 500 }
    );
  }
}),

// ✅ 프로필 이미지 삭제
http.delete('/api/profile/image', async () => {
  const loggedInUser = getSessionUser();
  if (!loggedInUser) {
    return HttpResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    // 현재 로그인한 유저의 프로필 이미지 삭제
    const user = users.find(u => u.email === loggedInUser.email);
    if (user) {
      user.profile_image = null;
      
      // 세션 유저 정보도 업데이트
      setSessionUser({
        ...loggedInUser,
        profile_image: null
      });
    }

    return HttpResponse.json({ 
      success: true,
      message: '프로필 이미지가 삭제되었습니다.'
    });
  } catch (error) {
    return HttpResponse.json(
      { error: '이미지 삭제 실패' },
      { status: 500 }
    );
  }
}),
];
