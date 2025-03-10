import { http, HttpResponse } from 'msw';

let users = [
  {
    id: 7,
    email: 'admin@naver.com',
    pwd: '1q2w3e4r',
    profileImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    name: 'admin',
  },
  {
    id: 8,
    email: 'user1@gmail.com',
    pwd: '1q2w3e4r',
    profileImg: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    name: 'user1',
  },
];

// ✅ `document.cookie`에서 사용자 세션 가져오기
const getSessionUser = () => {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('sessionUser='));

  return cookie ? JSON.parse(decodeURIComponent(cookie.split('=')[1])) : null;
};

// ✅ 회원가입
const registerHandler = http.post('api/register', async ({ request }) => {
  try {
    const { email, pwd } = await request.json();

    if (!email || !pwd) {
      return HttpResponse.json(
        { success: false, message: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    if (users.some(user => user.email === email)) {
      return HttpResponse.json(
        { success: false, message: '이미 존재하는 이메일입니다.' },
        { status: 409 }
      );
    }

    const newUser = {
      id: users.length + 1,
      email,
      pwd,
      profileImg: null,
      name: email.split('@')[0],
    };

    users.push(newUser);

    return HttpResponse.json({
      success: true,
      message: '회원가입 성공',
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 로그인
const loginHandler = http.post('api/login', async ({ request }) => {
  try {
    const reqBody = await request.json();
    const { email, pwd } = reqBody;

    if (!email || !pwd) {
      return HttpResponse.json(
        { success: false, message: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: '존재하지 않는 이메일입니다.',
        },
        { status: 401 }
      );
    }

    if (user.pwd !== pwd) {
      return HttpResponse.json(
        {
          success: false,
          message: '비밀번호를 다시 입력해주세요.',
        },
        { status: 401 }
      );
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImg: user.profileImg,
    };

    // 세션에 사용자 정보 저장
    sessionStorage.setItem('sessionUser', JSON.stringify(userData));

    return HttpResponse.json({
      success: true,
      message: '로그인 성공',
      data: { user: userData },
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 현재 로그인한 사용자 정보
const getMeHandler = http.get('api/users/me', async () => {
  try {
    const sessionUser = sessionStorage.getItem('sessionUser');
    if (!sessionUser) {
      return HttpResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = JSON.parse(sessionUser);

    return HttpResponse.json({
      success: true,
      message: '사용자 정보 조회 성공',
      data: [
        {
          id: user.id,
          email: user.email,
          profileImg: user.profileImg,
          name: user.name,
        },
      ],
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 로그아웃
const logoutHandler = http.post('api/logout', async () => {
  try {
    const sessionUser = sessionStorage.getItem('sessionUser');
    sessionStorage.removeItem('sessionUser');

    return HttpResponse.json({
      success: true,
      message: sessionUser ? '로그아웃 성공' : '이미 로그아웃 상태입니다.',
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '로그아웃 실패' },
      { status: 500 }
    );
  }
});

// ✅ 프로필 이미지 수정
const profileHandler = http.patch('api/users/me', async ({ request }) => {
  try {
    const reqBody = await request.json();
    const { profileImg } = reqBody;
    const user = JSON.parse(sessionStorage.getItem('sessionUser'));

    // 사용자 객체 업데이트
    user.profileImg = profileImg;

    // users 배열에서 해당 사용자 업데이트
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].profileImg = profileImg;
    }

    // 세션 스토리지 업데이트
    sessionStorage.setItem('sessionUser', JSON.stringify(user));

    return HttpResponse.json({
      success: true,
      message: '프로필 이미지가 성공적으로 업데이트되었습니다.',
      data: {
        userEmail: user.email,
        profileImg: user.profileImg,
      },
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 프로필 이미지 삭제
const profileDeleteHandler = http.delete('api/users/me', async () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('sessionUser'));
    if (!user.profileImg) {
      return HttpResponse.json(
        {
          success: false,
          message: '프로필 이미지를 찾을 수 없거나 이미 삭제되었습니다.',
        },
        { status: 404 }
      );
    }

    // 사용자 객체 업데이트
    user.profileImg = null;

    // users 배열에서 해당 사용자 업데이트
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].profileImg = null;
    }

    // 세션 스토리지 업데이트
    sessionStorage.setItem('sessionUser', JSON.stringify(user));

    return HttpResponse.json({
      success: true,
      message: '프로필 이미지가 성공적으로 삭제되었습니다.',
      data: {
        userEmail: user.email,
        profileImg: null,
      },
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 사용자 인증 확인
const checkAuthHandler = http.get('api/users/me', async ({ request }) => {
  try {
    const sessionUser = sessionStorage.getItem('sessionUser');

    if (!sessionUser) {
      return HttpResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userData = JSON.parse(sessionUser);
    const user = users.find(u => u.id === userData.id);

    if (!user) {
      return HttpResponse.json(
        { success: false, message: '유효하지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          profileImg: user.profileImg,
          name: user.name,
        },
      },
    });
  } catch (error) {
    return HttpResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 특정 사용자의 프로필 정보 조회
const getUserProfileHandler = http.get(
  'api/users/profile/:email',
  async ({ params }) => {
    try {
      const { email } = params;

      // 사용자 찾기
      const user = users.find(u => u.email === email);

      if (!user) {
        return HttpResponse.json(
          { success: false, message: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: '사용자 프로필 정보 조회 성공',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImg: user.profileImg,
        },
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
);

export const authHandlers = [
  registerHandler,
  loginHandler,
  getMeHandler,
  logoutHandler,
  profileHandler,
  profileDeleteHandler,
  checkAuthHandler,
  getUserProfileHandler,
];
