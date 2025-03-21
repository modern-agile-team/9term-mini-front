import { http, HttpResponse } from 'msw';

let posts = [
  {
    postId: 1,
    content: '오늘 점심은 맛있는 파스타 🍝',
    postImg: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
    createdAt: new Date().toISOString(),
    author: 'admin@naver.com',
    likedBy: ['user1@gmail.com'],
  },
  {
    postId: 2,
    content: '주말 카페 나들이 ☕️',
    postImg: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    author: 'admin@naver.com',
    likedBy: [],
  },
  {
    postId: 3,
    content: '벚꽃 구경 🌸',
    postImg: 'https://images.unsplash.com/photo-1522383225653-ed111181a951',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2일 전
    author: 'user1@gmail.com',
    likedBy: ['admin@naver.com'],
  },
];

// ✅ 쿠키에서 사용자 정보 가져오기
const getSessionUser = () => {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('sessionUser='));

  return cookie ? JSON.parse(decodeURIComponent(cookie.split('=')[1])) : null;
};

// ✅ 새로운 postId 생성 함수
const generateNewPostId = () => {
  const maxId = posts.reduce((max, post) => Math.max(max, post.postId), 0);
  return maxId + 1;
};

// ✅ 게시물 목록 조회 (`GET /api/posts`)
const getPostsHandler = http.get('api/posts', async () => {
  try {
    return HttpResponse.json({
      success: true,
      message: '게시물 조회 성공',
      data: posts,
    });
  } catch (error) {
    return HttpResponse.json(
      {
        success: false,
        message: '게시물 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
});

// ✅ 게시물 상세 조회 (`GET /api/posts/:id`)
const getPostByIdHandler = http.get('api/posts/:id', async ({ params }) => {
  try {
    const postId = Number(params.id);
    const post = posts.find(p => p.postId === postId);

    if (!post) {
      return HttpResponse.json(
        { success: false, message: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: '게시물 조회 성공',
      data: post,
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '게시물 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 게시물 생성 (`POST /api/posts`)
const createPostHandler = http.post('api/posts', async ({ request }) => {
  const sessionUser = getSessionUser();
  if (!sessionUser) {
    return HttpResponse.json(
      { success: false, message: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const { content, postImg } = await request.json();

    if (!postImg) {
      return HttpResponse.json(
        { success: false, message: '게시물 이미지는 필수입니다.' },
        { status: 400 }
      );
    }

    if (!postImg.startsWith('data:image/')) {
      return HttpResponse.json(
        { error: '유효하지 않은 인코딩 이미지입니다.' },
        { status: 400 }
      );
    }

    const newPost = {
      postId: generateNewPostId(),
      content,
      postImg,
      createdAt: new Date().toISOString(),
      author: sessionUser.email,
      likedBy: [],
    };

    posts.unshift(newPost);

    return HttpResponse.json({
      success: true,
      message: '게시물 생성 성공',
      data: { postId: newPost.postId },
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 게시물 수정 (`PATCH /api/posts/:id`)
const updatePostHandler = http.patch(
  'api/posts/:id',
  async ({ request, params }) => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      return HttpResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    try {
      const postId = Number(params.id);
      const post = posts.find(p => p.postId === postId);

      if (!post) {
        return HttpResponse.json(
          {
            success: false,
            message: '수정 권한이 없거나 게시물이 존재하지 않습니다.',
          },
          { status: 403 }
        );
      }

      if (post.author !== sessionUser.email) {
        return HttpResponse.json(
          {
            success: false,
            message: '수정 권한이 없거나 게시물이 존재하지 않습니다.',
          },
          { status: 403 }
        );
      }

      const updateData = await request.json();

      if (
        updateData.postImg &&
        updateData.postImg !== post.postImg &&
        !updateData.postImg.startsWith('data:image/') &&
        !updateData.postImg.startsWith('http')
      ) {
        return HttpResponse.json(
          { success: false, message: '유효하지 않은 인코딩 이미지입니다.' },
          { status: 400 }
        );
      }

      // 게시물 업데이트 (내용만 변경하는 경우 이미지는 유지)
      const updatedPost = {
        ...post,
        content: updateData.content || post.content,
      };

      // 이미지가 제공된 경우에만 이미지 업데이트
      if (updateData.postImg) {
        updatedPost.postImg = updateData.postImg;
      }

      // 게시물 배열에서 해당 게시물 업데이트
      const postIndex = posts.findIndex(p => p.postId === postId);
      if (postIndex !== -1) {
        posts[postIndex] = updatedPost;
      }

      return HttpResponse.json(
        {
          success: true,
          message: '게시물 수정 성공',
        },
        { status: 200 }
      );
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: '게시물 수정 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
);

// ✅ 게시물 삭제 (`DELETE /api/posts/:id`)
const deletePostHandler = http.delete('api/posts/:id', async ({ params }) => {
  const sessionUser = getSessionUser();
  if (!sessionUser) {
    return HttpResponse.json(
      { success: false, message: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const postId = Number(params.id);
    const postIndex = posts.findIndex(p => p.postId === postId);

    if (postIndex === -1 || posts[postIndex].author !== sessionUser.email) {
      return HttpResponse.json(
        {
          success: false,
          message: '삭제 권한이 없거나 게시물이 존재하지 않습니다.',
        },
        { status: 403 }
      );
    }

    posts.splice(postIndex, 1);

    return HttpResponse.json({
      success: true,
      message: '게시물 삭제 성공',
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '게시물 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 좋아요 토글 (`POST /api/posts/:id/like`)
const likePostHandler = http.post('api/posts/:id/like', async ({ params }) => {
  const sessionUser = getSessionUser();
  if (!sessionUser) {
    return HttpResponse.json(
      { success: false, message: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const postId = Number(params.id);
    const post = posts.find(p => p.postId === postId);

    if (!post) {
      return HttpResponse.json(
        { success: false, message: '게시물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!post.likedBy) {
      post.likedBy = [];
    }

    const isLiked = post.likedBy.includes(sessionUser.email);

    if (isLiked) {
      post.likedBy = post.likedBy.filter(email => email !== sessionUser.email);
      return HttpResponse.json({
        success: true,
        message: '좋아요 취소됨',
        data: { liked: false, totalLikes: post.likedBy.length },
      });
    } else {
      post.likedBy.push(sessionUser.email);
      return HttpResponse.json({
        success: true,
        message: '좋아요 추가됨',
        data: { liked: true, totalLikes: post.likedBy.length },
      });
    }
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '좋아요 토글 중 오류 발생' },
      { status: 500 }
    );
  }
});

// ✅ 좋아요 상태 조회 (`GET /api/posts/:id/like`)
const getLikeStatusHandler = http.get(
  'api/posts/:id/like',
  async ({ params }) => {
    const sessionUser = getSessionUser();

    try {
      const postId = Number(params.id);
      const post = posts.find(p => p.postId === postId);

      if (!post) {
        return HttpResponse.json(
          { success: false, message: '게시물을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (!post.likedBy) {
        post.likedBy = [];
      }

      const isLiked = sessionUser
        ? post.likedBy.includes(sessionUser.email)
        : false;

      return HttpResponse.json({
        success: true,
        liked: isLiked,
        totalLikes: post.likedBy.length,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: '좋아요 상태 조회 중 오류 발생' },
        { status: 500 }
      );
    }
  }
);

export const postHandlers = [
  getPostsHandler,
  getPostByIdHandler,
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
  likePostHandler,
  getLikeStatusHandler,
];
