import { http, HttpResponse } from 'msw';

// 🟢 로그인 가능한 더미 사용자 데이터
let users = [
  {
    id: 1,
    username: 'hee_min',
    email: 'af@naver.com',
    password: '1q2w3e4r', // 실제로는 비번을 저장하면 안 되지만, 여기서는 모킹 데이터라 허용
    profileImg:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7LpapIl8DITfz4_Y2z7pqs7FknPkjReAZCg&s',
  },
  {
    id: 2,
    username: 'user2',
    email: 'user2@example.com',
    password: 'password123',
    profileImg:
      'https://cdn.pixabay.com/photo/2024/02/26/19/39/monochrome-image-8598798_1280.jpg',
  },
];

// 🟢 더미 게시물 데이터
let posts = [
  {
    id: 1,
    userId: 1,
    email: 'af@naver.com',
    postImg:
      'https://cdn.news.hidoc.co.kr/news/photo/202104/24409_58461_0826.jpg',
    content: '여행왔슈',
    likes: 10,
    likedBy: [],
    createdAt: new Date().toISOString(),
    comments: [
      { id: 1, email: 'user3@a.com', text: '멋진 사진이네요!' },
      { id: 2, email: 'user5@a.com', text: '어디로 여행 가셨나요?' },
    ],
  },
  {
    id: 2,
    userId: 2,
    email: 'user2@example.com',
    postImg:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmMPQb8IJeXeHn_Fxj8HN19mDbRKEFCmCjwQ&s',
    content: '냐옹이',
    likes: 5,
    likedBy: [],
    createdAt: new Date().toISOString(),
    comments: [
      { id: 1, email: 'user6@a.com', text: '귀엽군' },
      { id: 2, email: 'user4@a.com', text: '이름이 뭐야옹?' },
    ],
  },
];

// 🟢 현재 로그인한 사용자 가져오기
const getSessionUser = () => {
  const session = sessionStorage.getItem('sessionUser');
  return session ? JSON.parse(session) : null;
};

// 🟢 초기 로그인된 사용자 설정 (기본 유저)
if (!sessionStorage.getItem('sessionUser')) {
  sessionStorage.setItem('sessionUser', JSON.stringify(users[0]));
}

// 🟢 MSW 핸들러 설정
export const handlers = [
  // ✅ 회원가입 (`POST /api/register`)
  http.post('/api/register', async ({ request }) => {
    const newUser = await request.json();

    if (users.some(user => user.email === newUser.email)) {
      return HttpResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 400 }
      );
    }

    const newId = users.length + 1;
    const user = {
      id: newId,
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      profileImg: 'https://via.placeholder.com/150',
    };

    users.push(user);
    sessionStorage.setItem('sessionUser', JSON.stringify(user));

    return HttpResponse.json({ success: true, user });
  }),

  // ✅ 로그인 (`POST /api/login`)
  http.post('/api/login', async ({ request }) => {
    const { email, password } = await request.json();

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return HttpResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    sessionStorage.setItem('sessionUser', JSON.stringify(user));

    return HttpResponse.json({
      success: true,
      user,
      token: 'fake-jwt-token',
    });
  }),

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

  // ✅ 게시물 목록 조회 (`GET /api/posts`)
  http.get('/api/posts', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const perPage = 2; // 한 페이지당 2개씩 게시물 표시
    const startIndex = (page - 1) * perPage;
    const paginatedPosts = posts.slice(startIndex, startIndex + perPage);

    return HttpResponse.json(paginatedPosts);
  }),

  // ✅ 게시물 수정 (`PATCH /api/posts/:id`)
  http.patch('/api/posts/:id', async ({ request, params }) => {
    const loggedInUser = getSessionUser();
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const postId = Number(params.id);
    const updateData = await request.json();
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (post.userId !== loggedInUser.id) {
      return HttpResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    post.content = updateData.content;
    return HttpResponse.json(post);
  }),

  // ✅ 게시물 삭제 (`DELETE /api/posts/:id`)
  http.delete('/api/posts/:id', async ({ params }) => {
    const loggedInUser = getSessionUser();
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const postId = Number(params.id);
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (posts[postIndex].userId !== loggedInUser.id) {
      return HttpResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    posts.splice(postIndex, 1);
    return HttpResponse.json({ success: true, msg: '게시물 삭제 완료' });
  }),

  // ✅ 좋아요 / 좋아요 취소 (`POST /api/posts/:id/like`)
  http.patch('/api/posts/:id/like', async ({ params, request }) => {
    const loggedInUser = getSessionUser();
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const postId = Number(params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const { isLiked } = await request.json();
    if (isLiked) {
      if (!post.likedBy.includes(loggedInUser.email)) {
        post.likes += 1;
        post.likedBy.push(loggedInUser.email);
      }
    } else {
      post.likes = Math.max(0, post.likes - 1);
      post.likedBy = post.likedBy.filter(email => email !== loggedInUser.email);
    }

    return HttpResponse.json({ success: true, likes: post.likes });
  }),

  // ✅ 댓글 목록 조회 (`GET /api/posts/:id/comments`)
  http.get('/api/posts/:id/comments', async ({ params }) => {
    const postId = Number(params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(post.comments);
  }),

  // ✅ 댓글 추가 (`POST /api/posts/:id/comments`)
  http.post('/api/posts/:id/comments', async ({ request, params }) => {
    const loggedInUser = getSessionUser();
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const postId = Number(params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const newComment = await request.json();
    const newId = Math.max(...post.comments.map(c => c.id), 0) + 1;

    const comment = {
      id: newId,
      email: loggedInUser.email,
      text: newComment.text,
    };

    post.comments.push(comment);
    return HttpResponse.json(comment, { status: 201 });
  }),

  // ✅ 댓글 삭제 (`DELETE /api/comments/:id`)
  http.delete('/api/comments/:id', async ({ params }) => {
    const loggedInUser = getSessionUser();
    if (!loggedInUser) {
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    for (const post of posts) {
      const commentIndex = post.comments.findIndex(
        c => c.id === Number(params.id)
      );

      if (commentIndex !== -1) {
        if (post.comments[commentIndex].email !== loggedInUser.email) {
          return HttpResponse.json(
            { error: '삭제 권한이 없습니다.' },
            { status: 403 }
          );
        }

        post.comments.splice(commentIndex, 1);
        return HttpResponse.json({ success: true, msg: '댓글 삭제 완료' });
      }
    }

    return HttpResponse.json(
      { error: '댓글을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }),
];
