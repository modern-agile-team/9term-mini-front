import { http, HttpResponse } from 'msw';

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

const getSessionUser = () => {
  const session = sessionStorage.getItem('sessionUser');
  return session ? JSON.parse(session) : null;
};

// ✅ 좋아요 / 좋아요 취소 핸들러 추가 (누락된 부분 수정!)
const likePostHandler = http.patch(
  '/api/posts/:id/like',
  async ({ params, request }) => {
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
  }
);

// ✅ 기존 postHandlers에 likePostHandler 추가
export const postHandlers = [
  http.get('/api/posts', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const perPage = 2;
    const startIndex = (page - 1) * perPage;
    const paginatedPosts = posts.slice(startIndex, startIndex + perPage);

    return HttpResponse.json(paginatedPosts);
  }),

  http.patch('/api/posts/:id', async ({ request, params }) => {
    const loggedInUser = getSessionUser();
    if (!loggedInUser)
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );

    const postId = Number(params.id);
    const updateData = await request.json();
    const post = posts.find(p => p.id === postId);

    if (!post)
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );

    if (post.userId !== loggedInUser.id)
      return HttpResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      );

    post.content = updateData.content;
    return HttpResponse.json(post);
  }),
  http.get('/api/posts/:id', async ({ params }) => {
    const postId = Number(params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(post);
  }),

  http.put('/api/posts/:id', async ({ request, params }) => {
    const loggedInUser = getSessionUser();
    if (!loggedInUser)
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );

    const postId = Number(params.id);
    const updateData = await request.json();
    const post = posts.find(p => p.id === postId);

    if (!post)
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );

    if (post.userId !== loggedInUser.id)
      return HttpResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      );

    post.content = updateData.content;
    post.postImg = updateData.postImg; // ✅ 이미지도 업데이트 되도록 추가
    return HttpResponse.json(post);
  }),

  http.delete('/api/posts/:id', async ({ params }) => {
    const loggedInUser = getSessionUser();
    if (!loggedInUser)
      return HttpResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );

    const postId = Number(params.id);
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1)
      return HttpResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );

    if (posts[postIndex].userId !== loggedInUser.id)
      return HttpResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      );

    posts.splice(postIndex, 1);
    return HttpResponse.json({ success: true, msg: '게시물 삭제 완료' });
  }),
    

  likePostHandler,
];
