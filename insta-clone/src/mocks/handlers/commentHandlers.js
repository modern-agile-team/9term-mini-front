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

  // ✅ 댓글 목록 조회 (`GET /api/posts/:id/comments`)
  const getCommentsHandler = http.get(
    'api/posts/:id/comments',
    async ({ params }) => {
      const postId = Number(params.id);
      const post = posts.find(p => p.id === postId);

      if (!post) {
        return HttpResponse.json(
          { error: '게시물을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return HttpResponse.json(post.comments);
    }
  );

  // ✅ 댓글 추가 (`POST /api/posts/:id/comments`)
  const addCommentHandler = http.post(
    'api/posts/:id/comments',
    async ({ request, params }) => {
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
    }
  );

  // ✅ 댓글 삭제 (`DELETE /api/comments/:id`)
  const deleteCommentHandler = http.delete(
    'api/comments/:id',
    async ({ params }) => {
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
    }
  );

  // ✅ 핸들러 배열 내보내기
  export const commentHandlers = [
    getCommentsHandler,
    addCommentHandler,
    deleteCommentHandler,
  ];
