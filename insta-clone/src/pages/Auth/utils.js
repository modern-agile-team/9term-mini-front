import isValidEmail from '@/utils/isValidEmail';

export default function validateAuth({ email, pwd }) {
  if (!email || !pwd) {
    return {
      isValid: false,
      error: '이메일과 비밀번호를 모두 입력해주세요.',
    };
  }

  if (!isValidEmail(email)) {
    return {
      isValid: false,
      error: '올바른 이메일 형식을 입력해주세요.',
    };
  }

  if (pwd.length < 6) {
    return {
      isValid: false,
      error: '비밀번호는 최소 6자 이상이어야 합니다.',
    };
  }

  return {
    isValid: true,
    error: '',
  };
}
