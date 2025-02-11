import { useState, useEffect } from 'react';

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loginAndFetchUser = async () => {
      try {
        // 1️⃣ 로그인 요청
        const loginResponse = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'mockUser123',
            password: 'password123',
          }),
        });

        if (!loginResponse.ok) {
          console.error('로그인 실패:', await loginResponse.json());
          return;
        }

        // 2️⃣ 로그인 후 사용자 정보 가져오기
        const response = await fetch('/api/user');
        if (!response.ok) {
          console.error('사용자 정보 가져오기 실패:', await response.json());
          return;
        }

        const data = await response.json();
        setCurrentUser(data.username);
      } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
      }
    };

    loginAndFetchUser();
  }, []);

  return currentUser;
};

export default useCurrentUser;
