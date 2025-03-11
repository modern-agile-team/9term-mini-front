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
  console.log('[MSW] 모든 쿠키:', document.cookie);

  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('sessionUser='));

  console.log('[MSW] sessionUser 쿠키:', cookie || '없음');

  if (!cookie) return null;

  try {
    const decodedCookie = decodeURIComponent(cookie.split('=')[1]);
    const user = JSON.parse(decodedCookie);
    return user;
  } catch (error) {
    console.error('[MSW] 쿠키 파싱 오류:', error);
    return null;
  }
};

// ✅ 쿠키 설정 함수
const setSessionCookie = userData => {
  // 쿠키 만료 시간 설정 (예: 7일)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  // 쿠키 설정 (SameSite=None, Secure 옵션 제거하여 로컬 개발 환경에서 작동하도록)
  const cookieValue = encodeURIComponent(JSON.stringify(userData));
  document.cookie = `sessionUser=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/`;

  console.log('쿠키 설정됨:', document.cookie);
};

// ✅ 쿠키 삭제 함수
const clearSessionCookie = () => {
  document.cookie =
    'sessionUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
    const { email, pwd } = await request.json();
    console.log(`[MSW] 로그인 시도: ${email}`);

    if (!email || !pwd) {
      return HttpResponse.json(
        {
          success: false,
          message: '이메일과 비밀번호는 필수입니다.',
        },
        { status: 400 }
      );
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      console.log(`[MSW] 로그인 실패: 존재하지 않는 이메일 - ${email}`);
      return HttpResponse.json(
        {
          success: false,
          message: '존재하지 않는 이메일입니다.',
        },
        { status: 401 }
      );
    }

    if (user.pwd !== pwd) {
      console.log(`[MSW] 로그인 실패: 비밀번호 불일치 - ${email}`);
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

    // 쿠키에 사용자 정보 저장
    setSessionCookie(userData);

    console.log(`[MSW] 로그인 성공: ${email}`);

    return HttpResponse.json({
      success: true,
      message: '로그인 성공',
      data: { user: userData },
    });
  } catch (error) {
    console.error('[MSW] 로그인 오류:', error);
    return HttpResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 현재 로그인한 사용자 정보
const getMeHandler = http.get('api/users/me', async () => {
  try {
    // 쿠키에서 세션 정보 가져오기
    const sessionUser = getSessionUser();
    console.log(
      '[MSW] /api/users/me 호출됨, 세션 사용자:',
      sessionUser ? '있음' : '없음'
    );

    if (!sessionUser) {
      console.log('[MSW] 인증되지 않은 사용자');
      return HttpResponse.json(
        { success: false, message: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    console.log('[MSW] 인증된 사용자:', sessionUser.email);
    return HttpResponse.json({
      success: true,
      message: '사용자 정보 조회 성공',
      data: [sessionUser],
    });
  } catch (error) {
    console.error('[MSW] 사용자 정보 조회 오류:', error);
    return HttpResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
});

// ✅ 로그아웃
const logoutHandler = http.post('api/logout', () => {
  // 쿠키에서 세션 정보 삭제
  clearSessionCookie();

  return HttpResponse.json({
    success: true,
    message: '로그아웃 성공',
  });
});

// ✅ 프로필 이미지 수정
const profileHandler = http.patch('api/users/me', async ({ request }) => {
  try {
    const reqBody = await request.json();
    const { profileImg } = reqBody;

    // 쿠키에서 사용자 정보 가져오기
    const sessionUser = getSessionUser();

    if (!sessionUser) {
      return HttpResponse.json(
        { success: false, message: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 사용자 객체 업데이트
    sessionUser.profileImg = profileImg;

    // users 배열에서 해당 사용자 업데이트
    const userIndex = users.findIndex(u => u.id === sessionUser.id);
    if (userIndex !== -1) {
      users[userIndex].profileImg = profileImg;
    }

    // 쿠키 업데이트
    setSessionCookie(sessionUser);

    return HttpResponse.json({
      success: true,
      message: '프로필 이미지가 성공적으로 업데이트되었습니다.',
      data: {
        userEmail: sessionUser.email,
        profileImg: sessionUser.profileImg,
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
    // 쿠키에서 사용자 정보 가져오기
    const sessionUser = getSessionUser();

    if (!sessionUser) {
      return HttpResponse.json(
        { success: false, message: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    if (!sessionUser.profileImg) {
      return HttpResponse.json(
        {
          success: false,
          message: '프로필 이미지를 찾을 수 없거나 이미 삭제되었습니다.',
        },
        { status: 404 }
      );
    }

    // 사용자 객체 업데이트
    sessionUser.profileImg = null;

    // users 배열에서 해당 사용자 업데이트
    const userIndex = users.findIndex(u => u.id === sessionUser.id);
    if (userIndex !== -1) {
      users[userIndex].profileImg = null;
    }

    // 쿠키 업데이트
    setSessionCookie(sessionUser);

    return HttpResponse.json({
      success: true,
      message: '프로필 이미지가 성공적으로 삭제되었습니다.',
      data: {
        userEmail: sessionUser.email,
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
