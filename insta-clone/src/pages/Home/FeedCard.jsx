import { useState, useEffect } from 'react';
import CommentInput from '@/pages/Home/CommentInput';
import CommentList from '@/pages/Home/CommentList';
import useAuth from '@/hooks/useAuth';
import useLike from '@/hooks/useLike';
import useComments from '@/hooks/useComments';
import apiClient from '@/services/apiClient';
import CreatePostModal from '@/pages/Posts/CreatePostModal';
import useProfileStore from '@/store/useProfileStore';

const FeedCard = ({
  postId,
  content,
  postImg,
  createdAt,
  author,
  onDelete,
}) => {
  // ✅ postId가 없으면 오류 출력 후 렌더링하지 않음
  if (!postId) {
    console.error('❌ [FeedCard] postId가 없습니다!', {
      postId,
      author,
      content,
    });
    return null;
  }

  const [postContent, setPostContent] = useState(content);
  const [showComments, setShowComments] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { likeCount, isLiked, toggleLike } = useLike(0, postId);
  const { commentList, addComment, deleteComment, isLoading, fetchComments } =
    useComments({
      postId,
      currentUser: user,
    });
  const { profileImages } = useProfileStore();
  const [authorProfileImg, setAuthorProfileImg] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);

  // ✅ 댓글 표시 상태가 변경될 때 댓글 목록 다시 불러오기
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  // ✅ 작성자의 프로필 이미지 가져오기
  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        // 현재 로그인한 사용자가 작성자인 경우
        if (user && user.email === author) {
          setAuthorProfileImg(user.profileImg);
          return;
        }

        // 작성자가 현재 로그인한 사용자가 아닌 경우, 백엔드에서 작성자 정보 가져오기
        const response = await apiClient.get(`api/users/profile/${author}`, {
          throwHttpErrors: false,
        });

        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await response.json();

          if (jsonResponse.success && jsonResponse.data) {
            setAuthorProfileImg(jsonResponse.data.profileImg);
          }
        } else {
          console.error('❌ 응답이 JSON 형식이 아님:', contentType);
        }
      } catch (error) {
        console.error('작성자 프로필 이미지 가져오기 실패:', error);
      }
    };

    fetchAuthorProfile();
  }, [author, user]);

  // ✅ 프로필 이미지 업데이트 이벤트 리스너
  useEffect(() => {
    const handleProfileUpdate = event => {
      // 현재 로그인한 사용자가 작성자인 경우에만 프로필 이미지 업데이트
      if (user && user.email === author) {
        setAuthorProfileImg(event.detail.profileImg);
        console.log(
          '✅ [FeedCard] 프로필 이미지 업데이트:',
          event.detail.profileImg
        );
      }
    };

    window.addEventListener('profile:updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile:updated', handleProfileUpdate);
    };
  }, [author, user]);

  // ✅ 게시물 수정 모드 활성화
  const handleEditPost = () => setIsEditMode(true);

  // ✅ 게시물 삭제 처리
  const handleDeletePost = async () => {
    if (!window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) return;

    try {
      const response = await apiClient.delete(`api/posts/${postId}`, {
        throwHttpErrors: false,
      });

      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await response.json();

        if (!jsonResponse.success) {
          throw new Error(
            jsonResponse.message || '게시물 삭제에 실패했습니다.'
          );
        }
      }

      alert('게시물이 삭제되었습니다.');

      // ✅ 삭제 콜백 함수가 있을 경우 실행
      if (onDelete) onDelete(postId);
    } catch (error) {
      alert('게시물 삭제에 실패했습니다. 다시 시도해주세요.');
      console.error('게시물 삭제 실패:', error);
    }
  };

  // ✅ 좋아요 토글 (실패 시 이전 상태 복구)
  const handleLikeToggle = async () => {
    try {
      await toggleLike();
    } catch (error) {
      alert('좋아요 상태 업데이트에 실패했습니다.');
      console.error('좋아요 상태 업데이트 실패:', error);
    }
  };

  // ✅ 인증되지 않은 사용자는 아무것도 표시하지 않음
  if (!isAuthenticated) return null;

  return (
    <div className="p-4 mb-4 bg-white w-full max-w-lg mx-auto">
      {/* 프로필 및 수정/삭제 버튼 */}
      <div className="flex items-center space-x-2">
        <img
          src={authorProfileImg || '/assets/icons/profile.svg'}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="font-bold text-xs">{author}</span>
        {user?.email === author && (
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
          <span className="font-bold">{author}</span> {postContent}
        </p>
        <p
          className="text-xs text-gray-500 mt-1 cursor-pointer"
          onClick={() => setShowComments(!showComments)}
        >
          댓글 {commentList?.length || 0}개 모두보기
        </p>

        {/* 댓글 리스트 & 입력창 */}
        {showComments && (
          <>
            {isLoading ? (
              <p>댓글 불러오는 중...</p>
            ) : (
              <CommentList
                postId={postId}
                currentUser={user}
                commentList={commentList}
                onDeleteComment={deleteComment}
              />
            )}
            <CommentInput postId={postId} onCommentAdded={fetchComments} />
          </>
        )}
      </div>

      {/* 게시물 수정 모달 */}
      {isEditMode && (
        <CreatePostModal
          onClose={() => {
            setIsEditMode(false);
            // 게시글 수정 후 최신 데이터 가져오기
            const fetchUpdatedPost = async () => {
              try {
                const response = await apiClient.get(`api/posts/${postId}`, {
                  throwHttpErrors: false,
                });

                // 응답이 JSON인지 확인
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                  const jsonResponse = await response.json();

                  if (jsonResponse.success && jsonResponse.data) {
                    setPostContent(jsonResponse.data.content);
                    console.log(
                      '✅ [FeedCard] 게시글 업데이트 완료:',
                      jsonResponse.data
                    );
                  }
                } else {
                  console.error('❌ 응답이 JSON 형식이 아님:', contentType);
                }
              } catch (error) {
                console.error('게시글 업데이트 실패:', error);
              }
            };
            fetchUpdatedPost();
          }}
          postId={postId}
          initialData={{ postImg, content: postContent }}
        />
      )}
    </div>
  );
};

export default FeedCard;
