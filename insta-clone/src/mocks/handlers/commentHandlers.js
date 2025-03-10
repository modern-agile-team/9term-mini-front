import { http, HttpResponse } from 'msw';

// 댓글 저장소
let comments = [
  {
    id: 1,
    postId: 1,
    userId: 'user1@gmail.com',
    comment: '파스타가 정말 맛있어 보여요! 어디 맛집인가요?',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    postId: 1,
    userId: 'admin@naver.com',
    comment: '강남 파스타 맛집이에요~ 다음에 같이 가요!',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15분 전
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    postId: 2,
    userId: 'user1@gmail.com',
    comment: '분위기 좋은 카페네요 ✨',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12시간 전
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    postId: 3,
    userId: 'admin@naver.com',
    comment: '벚꽃이 너무 예쁘네요! 어디인가요?',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 세션에서 사용자 가져오기
const getSessionUser = () => {
  const sessionUser = sessionStorage.getItem('sessionUser');
  console.log('🔍 [MSW] 세션 사용자 확인:', sessionUser ? '있음' : '없음');
  return sessionUser ? JSON.parse(sessionUser) : null;
};

// ✅ 특정 게시물의 댓글 목록 조회
const getCommentsHandler = http.get(
  'api/posts/:postId/comments',
  async ({ params }) => {
    try {
      if (!params.postId) {
        return HttpResponse.json(
          { success: false, message: '게시물 ID가 필요합니다.' },
          { status: 400 }
        );
      }

      const postId = Number(params.postId);
      const postComments = comments.filter(c => c.postId === postId);

      // 댓글이 없어도 빈 배열 반환
      return HttpResponse.json({
        success: true,
        message: '댓글 조회 성공',
        data: postComments,
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
);

// ✅ 댓글 생성
const createCommentHandler = http.post(
  'api/posts/:postId/comments',
  async ({ request, params }) => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      return HttpResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    try {
      const postId = Number(params.postId);
      const { comment } = await request.json();

      if (!postId || !comment) {
        return HttpResponse.json(
          {
            success: false,
            message: '게시물 ID와 댓글 내용은 필수입니다.',
          },
          { status: 400 }
        );
      }

      const newComment = {
        id: comments.length + 1,
        postId,
        userId: sessionUser.email,
        comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      comments.push(newComment);

      return HttpResponse.json(
        {
          success: true,
          message: '댓글이 성공적으로 생성되었습니다.',
          data: newComment,
        },
        { status: 201 }
      );
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
);

// ✅ 댓글 삭제
const deleteCommentHandler = http.delete(
  'api/posts/:postId/comments/:commentId',
  async ({ params }) => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      return HttpResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    try {
      const commentId = Number(params.commentId);
      if (!commentId) {
        return HttpResponse.json(
          { success: false, message: '댓글 ID가 필요합니다.' },
          { status: 400 }
        );
      }

      const commentIndex = comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) {
        return HttpResponse.json(
          { success: false, message: '댓글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (comments[commentIndex].userId !== sessionUser.email) {
        return HttpResponse.json(
          { success: false, message: '댓글 삭제 권한이 없습니다.' },
          { status: 403 }
        );
      }

      comments.splice(commentIndex, 1);

      return HttpResponse.json({
        success: true,
        message: '댓글이 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
);

export const commentHandlers = [
  getCommentsHandler,
  createCommentHandler,
  deleteCommentHandler,
];
