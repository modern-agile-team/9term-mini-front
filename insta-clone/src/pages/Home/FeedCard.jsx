import { useState, useEffect } from 'react';
import CommentInput from '@/pages/Home/CommentInput';
import CommentList from '@/pages/Home/CommentList';
import useAuth from '@/hooks/useAuth';
import useLike from '@/hooks/useLike';
import useComments from '@/hooks/useComments';
import apiClient from '@/services/apiClient';
import CreatePostModal from '@/pages/Posts/CreatePostModal';

const FeedCard = ({
  id,
  userId,
  email,
  postImg,
  content,
  likes = 0,
  onDelete,
}) => {
  const [postContent, setPostContent] = useState(content);
  const [showComments, setShowComments] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { likeCount, isLiked, toggleLike } = useLike(likes, id);
  const { commentList, addComment, deleteComment, isLoading } = useComments({
    postId: id,
    currentUser: user,
  });

  // ✅ 수정 모드 상태 추가
  const [isEditMode, setIsEditMode] = useState(false);

  // ✅ 게시물 수정 (모달 열기)
  const handleEditPost = () => {
    setIsEditMode(true); // 수정 모드 활성화
  };

  // ✅ 게시물 삭제
  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`api/posts/${id}`);
      alert('게시물이 삭제되었습니다.');
      onDelete(id);
    } catch (error) {
      console.error('게시물 삭제 실패:', error);
    }
  };

  // ✅ 좋아요 토글
  const handleLikeToggle = async () => {
    try {
      await toggleLike();
      await apiClient.patch(`/api/posts/${id}/like`, {
        json: { isLiked: !isLiked },
      });
    } catch (error) {
      console.error('좋아요 상태 업데이트 실패:', error);
    }
  };

  if (!isAuthenticated) return null;

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
          <span className="font-bold text-xs">{email}</span>
        </div>
        {user?.id === userId && (
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
      <img src={postImg} alt="Post" className="w-full rounded-xs" />

      {/* 게시물 정보 */}
      <div className="mt-2 px-2">
        <div className="flex items-center space-x-4 mb-2">
          <img
            src={
              isLiked ? '/assets/icons/liked.svg' : '/assets/icons/likes.svg'
            }
            alt="Like"
            className="w-6 h-6 cursor-pointer"
            onClick={handleLikeToggle}
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
          <span className="font-bold">{email}</span> {postContent}
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
            {isLoading ? (
              <p>댓글 불러오는 중...</p>
            ) : (
              <CommentList
                postId={id}
                currentUser={user}
                onDeleteComment={deleteComment}
              />
            )}
            <CommentInput postId={id} />
          </>
        )}
      </div>

      {/* ✅ 게시물 수정 모달 */}
      {isEditMode && (
        <CreatePostModal
          onClose={() => setIsEditMode(false)}
          post={{ id, postImg, content: postContent }} // 기존 게시물 데이터 전달
        />
      )}
    </div>
  );
};

export default FeedCard;
