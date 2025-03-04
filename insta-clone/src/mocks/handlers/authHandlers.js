import { http, HttpResponse } from 'msw';

let users = [
  {
    id: 1,
    username: 'hee_min',
    email: 'af@naver.com',
    password: '1q2w3e4r',
    profileImg:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7LpapIl8DITfz4_Y2z7pqs7FknPkjReAZCg&s',
  },
  {
    id: 2,
    username: 'user2',
    email: 'user2@example.com',
    password: 'password123',
    profileImg:
      'https://cdn.pixabay.com/photo/2024/02/26/19/39/monochrome-image-8598798_1280.jpg',
  },
];

const getSessionUser = () => {
  const session = sessionStorage.getItem('sessionUser');
  return session ? JSON.parse(session) : null;
};

// ✅ 회원가입
const registerHandler = http.post('/api/register', async ({ request }) => {
  const newUser = await request.json();

  if (users.some(user => user.email === newUser.email)) {
    return HttpResponse.json(
      { error: '이미 가입된 이메일입니다.' },
      { status: 400 }
    );
  }

  const newId = users.length + 1;
  const user = {
    id: newId,
    ...newUser,
    profileImg: null,
  };

  users.push(user);
  sessionStorage.setItem('sessionUser', JSON.stringify(user));

  return HttpResponse.json({ success: true, user });
});

// ✅ 로그인
const loginHandler = http.post('/api/login', async ({ request }) => {
  const { email, password } = await request.json();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return HttpResponse.json(
      { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  sessionStorage.setItem('sessionUser', JSON.stringify(user));
  return HttpResponse.json({ success: true, user, token: 'fake-jwt-token' });
});

// ✅ 현재 로그인한 사용자 정보
const getMeHandler = http.get('/api/users/me', async () => {
  const loggedInUser = getSessionUser();
  if (!loggedInUser) {
    return HttpResponse.json(
      { error: '인증되지 않은 사용자입니다.' },
      { status: 401 }
    );
  }
  return HttpResponse.json(loggedInUser);
});

// ✅ 로그아웃
const logoutHandler = http.post('/api/logout', async () => {
  sessionStorage.removeItem('sessionUser');
  return HttpResponse.json({ success: true, msg: '로그아웃 성공' });
});

export const authHandlers = [
  registerHandler,
  loginHandler,
  getMeHandler,
  logoutHandler,
];
