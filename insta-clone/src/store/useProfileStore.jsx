import { create } from 'zustand';

const useProfileStore = create(set => ({
  profileImages: {},
  setProfileImage: (userId, image) => {
    return set(state => ({
      profileImages: {
        ...state.profileImages,
        [userId]: image,
      },
    }));
  },
  clearProfileImage: userId => {
    return set(state => {
      const newProfileImages = { ...state.profileImages };
      delete newProfileImages[userId];
      return { profileImages: newProfileImages };
    });
  },
  // 모든 프로필 이미지 상태 초기화
  resetProfileImages: () => {
    return set({ profileImages: {} });
  },
}));

export default useProfileStore;
