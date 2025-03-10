import { create } from 'zustand';

const useProfileStore = create(set => ({
  profileImages: {},
  setProfileImage: (userId, image) => {
    console.log('✅ [useProfileStore] 프로필 이미지 설정:', { userId, image });
    return set(state => ({
      profileImages: {
        ...state.profileImages,
        [userId]: image,
      },
    }));
  },
  clearProfileImage: userId => {
    console.log('✅ [useProfileStore] 프로필 이미지 삭제:', { userId });
    return set(state => {
      const newProfileImages = { ...state.profileImages };
      delete newProfileImages[userId];
      return { profileImages: newProfileImages };
    });
  },
  // 모든 프로필 이미지 상태 초기화
  resetProfileImages: () => {
    console.log('✅ [useProfileStore] 모든 프로필 이미지 초기화');
    return set({ profileImages: {} });
  },
}));

export default useProfileStore;
