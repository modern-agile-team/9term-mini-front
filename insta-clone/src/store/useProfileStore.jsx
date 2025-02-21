import { create } from 'zustand';

const useProfileStore = create(
  set => ({
    profileImage: null,
    setProfileImage: image => set({ profileImage: image }),
    clearProfileImage: () => set({ profileImage: null }),
  }),
  {
    name: 'profile-storage',
    getStorage: () => localStorage,
  }
);

export default useProfileStore;
