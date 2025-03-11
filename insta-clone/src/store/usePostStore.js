import { create } from 'zustand';

const usePostStore = create(set => ({
  posts: [],
  isLoading: false,
  hasMore: true,
  page: 1,

  // 게시물 목록 설정
  setPosts: posts => set({ posts }),

  // 게시물 추가 (새 게시물 생성)
  addPost: newPost => {
    return set(state => ({
      posts: [newPost, ...state.posts],
    }));
  },

  // 게시물 업데이트 (수정)
  updatePost: updatedPost => {
    return set(state => ({
      posts: state.posts.map(post =>
        post.postId === updatedPost.postId ? { ...post, ...updatedPost } : post
      ),
    }));
  },

  // 게시물 삭제
  deletePost: postId => {
    return set(state => ({
      posts: state.posts.filter(post => post.postId !== postId),
    }));
  },

  // 로딩 상태 설정
  setLoading: isLoading => set({ isLoading }),

  // 더 불러올 게시물이 있는지 설정
  setHasMore: hasMore => set({ hasMore }),

  // 페이지 설정
  setPage: page => set({ page }),

  // 페이지 증가
  incrementPage: () => set(state => ({ page: state.page + 1 })),

  // 상태 초기화
  resetState: () =>
    set({ posts: [], isLoading: false, hasMore: true, page: 1 }),
}));

export default usePostStore;
