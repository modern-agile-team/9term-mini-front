import { useState } from 'react';
import CommentInput from '@/pages/Home/CommentInput';
import CommentList from '@/pages/Home/CommentList';
import useCurrentUser from '@/hooks/useCurrentUser';
import useLike from '@/hooks/useLike';
import useComments from '@/hooks/useComments';
import apiClient from '@/services/apiClient';

const FeedCard = ({ id, user_id, post_img, content, likes = 0, onDelete }) => {
  const [postContent, setPostContent] = useState(content);
  const [showComments, setShowComments] = useState(false);
  const currentUser = useCurrentUser();
  // useLike 훅에 게시물 id와 초기 좋아요 개수를 넘겨서 ky를 이용한 요청 수행
  const { likeCount, isLiked, toggleLike } = useLike(likes, id);
  const { commentList, addComment, deleteComment, loading } = useComments({
    postId: id,
    currentUser,
  });

  // 게시물 수정: ky를 사용하여 PATCH 요청
  const handleEditPost = async () => {
    const newContent = prompt('게시글을 입력하세요:', postContent);
    if (!newContent) return;

    try {
      const response = await apiClient
        .patch(`posts/${id}`, {
          json: { content: newContent },
        })
        .json();

      alert('게시물이 수정되었습니다.');
      setPostContent(newContent);
    } catch (error) {
      console.error('게시물 수정 실패:', error);
    }
  };

  // 게시물 삭제: ky를 사용하여 DELETE 요청
  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`posts/${id}`);
      alert('게시물이 삭제되었습니다.');
      onDelete(id);
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
    }
  };

  if (currentUser === null) return <p>로딩 중...</p>;

  return (
    <div className="p-4 mb-4 bg-white w-full max-w-lg mx-auto">
      {/* 프로필 및 수정/삭제 버튼 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <img
            src="/assets/icons/profile.svg"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-bold text-xs">{user_id}</span>
        </div>
        {currentUser === user_id && (
          <div className="flex space-x-2">
            <button onClick={handleEditPost} className="text-blue-500 text-xs">
              수정
            </button>
            <button onClick={handleDeletePost} className="text-red-500 text-xs">
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 게시물 이미지 */}
      <img src={post_img} alt="Post" className="w-full rounded-xs" />

      {/* 게시물 정보 */}
      <div className="mt-2 px-2">
        <div className="flex items-center space-x-4 mb-2">
          <img
            src={
              isLiked ? '/assets/icons/liked.svg' : '/assets/icons/likes.svg'
            }
            alt="Like"
            className="w-6 h-6 cursor-pointer"
            onClick={toggleLike}
          />
          <img
            src="/assets/icons/comments.svg"
            alt="Comment"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <p className="text-sm font-bold">좋아요 {likeCount}개</p>
        <p className="text-sm mt-1">
          <span className="font-bold">{user_id}</span> {postContent}
        </p>
        <p
          className="text-xs text-gray-500 mt-1 cursor-pointer"
          onClick={() => setShowComments(!showComments)}
        >
          댓글 {commentList.length}개 모두보기
        </p>

        {/* 댓글 리스트 & 입력창 */}
        {showComments && (
          <>
            {loading ? (
              <p>댓글 불러오는 중...</p>
            ) : (
              <CommentList
                comments={commentList}
                currentUser={currentUser}
                onDeleteComment={deleteComment}
              />
            )}
            <CommentInput onAddComment={addComment} />
          </>
        )}
      </div>
    </div>
  );
};

export default FeedCard;
