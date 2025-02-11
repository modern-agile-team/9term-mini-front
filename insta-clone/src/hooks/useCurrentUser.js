import { useState, useEffect } from 'react';

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ✅ 1. 로컬스토리지에서 기존 로그인 정보 확인
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser).username);
          return;
        }

        // ✅ 2. 현재 로그인된 사용자 정보 가져오기
        const response = await fetch('/api/user');
        if (!response.ok) {
          console.error('사용자 정보 가져오기 실패:', await response.json());
          return;
        }

        const data = await response.json();
        setCurrentUser(data.username);

        // ✅ 3. 로그인 정보를 로컬스토리지에 저장 (페이지 새로고침 후에도 유지)
        localStorage.setItem('user', JSON.stringify(data));
      } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
      }
    };

    fetchUser();
  }, []);

  return currentUser;
};

export default useCurrentUser;
