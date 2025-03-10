import { create } from 'zustand';

const useProfileStore = create(set => ({
  profileImages: {},
  setProfileImage: (userId, image) =>
    set(state => ({
      profileImages: {
        ...state.profileImages,
        [userId]: image,
      },
    })),
  clearProfileImage: userId =>
    set(state => {
      const newProfileImages = { ...state.profileImages };
      delete newProfileImages[userId];
      return { profileImages: newProfileImages };
    }),
}));

export default useProfileStore;
