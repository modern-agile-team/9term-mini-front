import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/services/apiClient';
import useAuth from '@/hooks/useAuth';

// 댓글 캐시를 위한 객체 (전역 레벨)
const commentsCache = {};

const useComments = ({ postId } = {}) => {
  // ✅ postId가 없을 경우 빈 배열과 기본 함수 반환
  if (!postId) {
    console.warn('⚠️ [useComments] postId가 undefined입니다. 빈 데이터 반환');
    return {
      commentList: [],
      addComment: () => {},
      deleteComment: () => {},
      isLoading: false,
      fetchComments: () => {},
    };
  }

  const [commentList, setCommentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth(); // ✅ 로그인 상태 확인
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);

  // 컴포넌트 언마운트 시 isMounted 플래그 업데이트
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ 댓글 목록 불러오기 함수 (캐싱 적용)
  const fetchComments = useCallback(
    async (forceRefresh = false) => {
      if (!postId) return; // ✅ postId가 없으면 API 요청하지 않음

      // 캐시 확인 (마지막 요청 후 30초 이내면 캐시 사용)
      const now = Date.now();
      const cachedComments = commentsCache[postId];
      const timeSinceLastFetch = now - lastFetchTime.current;

      // 캐시가 있고, 강제 새로고침이 아니고, 마지막 요청 후 30초가 지나지 않았으면 캐시 사용
      if (cachedComments && !forceRefresh && timeSinceLastFetch < 30000) {
        setCommentList(cachedComments);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await apiClient.get(`api/posts/${postId}/comments`, {
          throwHttpErrors: false,
        });

        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await response.json();

          // 데이터가 배열인지 확인하고, 아니면 빈 배열로 처리
          const responseData =
            jsonResponse.success && Array.isArray(jsonResponse.data)
              ? jsonResponse.data
              : [];

          if (isMounted.current) {
            setCommentList(responseData);
            // 캐시 업데이트
            commentsCache[postId] = responseData;
            lastFetchTime.current = Date.now();
          }

          if (!jsonResponse.success) {
            console.warn(
              '⚠️ [useComments] 댓글 불러오기 실패:',
              jsonResponse.message
            );
          }
        } else {
          console.error('❌ 응답이 JSON 형식이 아님:', contentType);
          if (isMounted.current) {
            setCommentList([]);
          }
        }
      } catch (error) {
        console.error('❌ 댓글 데이터를 불러올 수 없습니다.', error);
        if (isMounted.current) {
          setCommentList([]);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [postId]
  );

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId, fetchComments]);

  // ✅ 댓글 추가 함수
  const addComment = useCallback(
    async newComment => {
      if (!postId || !newComment) {
        console.error('❌ [useComments] postId 또는 댓글 내용이 없습니다.');
        return;
      }
      if (!isAuthenticated) {
        console.error('❌ [useComments] 로그인 필요! 댓글 추가 불가');
        return;
      }

      try {
        const response = await apiClient.post(`api/posts/${postId}/comments`, {
          json: { comment: newComment },
          throwHttpErrors: false,
        });

        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await response.json();

          if (jsonResponse.success) {
            // 세션 스토리지에서 사용자 정보 가져오기
            const sessionUserStr = sessionStorage.getItem('sessionUser');
            const sessionUser = sessionUserStr
              ? JSON.parse(sessionUserStr)
              : null;

            const newCommentData = {
              id: jsonResponse.data.id,
              postId,
              userId:
                jsonResponse.data.userId ||
                (sessionUser ? sessionUser.email : 'unknown'),
              comment: newComment,
              createdAt: jsonResponse.data.createdAt,
              updatedAt: jsonResponse.data.updatedAt,
            };

            console.log('✅ 새 댓글 데이터:', newCommentData);

            // 댓글 목록에 새 댓글 추가
            if (isMounted.current) {
              setCommentList(prev => {
                const updatedComments = [...prev, newCommentData];
                // 캐시 업데이트
                commentsCache[postId] = updatedComments;
                return updatedComments;
              });
            }

            console.log(`✅ 댓글 추가 성공 (ID: ${jsonResponse.data.id})`);

            // 불필요한 API 호출 제거
            // await fetchComments();
          } else {
            console.warn(
              '⚠️ [useComments] 댓글 추가 실패:',
              jsonResponse.message
            );
          }
        } else {
          console.error('❌ 응답이 JSON 형식이 아님:', contentType);
        }
      } catch (error) {
        console.error('❌ 댓글 추가 실패:', error);
      }
    },
    [postId, isAuthenticated]
  );

  // ✅ 댓글 삭제 함수
  const deleteComment = useCallback(
    async commentId => {
      try {
        const response = await apiClient.delete(
          `api/posts/${postId}/comments/${commentId}`,
          { throwHttpErrors: false }
        );

        // 응답이 JSON인지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await response.json();

          if (jsonResponse.success) {
            if (isMounted.current) {
              setCommentList(prev => {
                const updatedComments = prev.filter(
                  comment => comment.id !== commentId
                );
                // 캐시 업데이트
                commentsCache[postId] = updatedComments;
                return updatedComments;
              });
            }
            console.log(`✅ 댓글 삭제 성공 (ID: ${commentId})`);
          } else {
            console.warn(
              '⚠️ [useComments] 댓글 삭제 실패:',
              jsonResponse.message
            );
          }
        } else {
          console.error('❌ 응답이 JSON 형식이 아님:', contentType);
          // 응답이 JSON이 아니더라도 UI에서는 삭제된 것처럼 처리
          if (isMounted.current) {
            setCommentList(prev => {
              const updatedComments = prev.filter(
                comment => comment.id !== commentId
              );
              // 캐시 업데이트
              commentsCache[postId] = updatedComments;
              return updatedComments;
            });
          }
        }
      } catch (error) {
        console.error('❌ 댓글 삭제 실패:', error);
      }
    },
    [postId]
  );

  return {
    commentList,
    addComment,
    deleteComment,
    isLoading,
    fetchComments: () => fetchComments(true), // 강제 새로고침 옵션 추가
  };
};

export default useComments;
