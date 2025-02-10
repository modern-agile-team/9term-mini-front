import React, { useState } from 'react';
import logoSvg from '/assets/icons/logo.svg';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 폼 제출 처리 함수
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 기본적인 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    // 회원가입 시도 로직 (아직 API 연결 전)
    try {
      console.log('회원가입 시도', { email, password });
      // 여기에 실제 API 호출 로직 추가
      setError(''); // 에러 초기화
    } catch (error) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      console.error('회원가입 실패', error);
    }
  };

  return (
    // 전체 페이지 컨테이너: 화면 전체 높이, 배경색 설정, 중앙 정렬
    <div className="max-w-[768px] w-full h-screen mx-auto overflow-hidden border border-gray-300 flex flex-col">
      {/* 메인 컨테이너: 모바일에서는 전체 너비, 데스크톱에서는 최대 350px */}
      
        {/* 회원가입 폼 박스: 흰색 배경, 테두리 설정 */}
        <div className="p-6 sm:p-10 mb-4">
          {/* Instagram 로고 */}
          <div className="flex justify-center mb-8">
            <img src={logoSvg} alt="Instagram" className="h-[51px] w-auto" />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">
              {error}
            </div>
          )}

          {/* 회원가입 폼 */}
          <form className="space-y-2 flex flex-col items-center" onSubmit={handleSubmit}>
            {/* 이메일 입력 필드 */}
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              aria-label="이메일"
              className="w-[40%] px-2 py-[9px] bg-[#fafafa] text-sm border border-gray-300 rounded-sm
                      focus:outline-none focus:border-gray-400 placeholder:text-xs
                      text-neutral-800 flex flex-col "
            />

            {/* 비밀번호 입력 필드 */}
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              aria-label="비밀번호"
              className="w-[40%] px-2 py-[9px] bg-[#fafafa] text-sm border border-gray-300 rounded-sm
                      focus:outline-none focus:border-gray-400 placeholder:text-xs
                      text-neutral-800 flex flex-col"
            />

            {/* 가입 버튼: Instagram 브랜드 색상 사용 */}
            <button
              type="submit"
              className="w-[40%] mt-2 bg-[#0095F6] text-white py-[7px]
              rounded text-sm font-semibold
              hover:bg-[#0095F6]/90 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              가입
            </button>
          </form>
        </div>

        {/* 로그인 링크 컨테이너 */}
        <div className="py-4 text-center">
          <span className="text-neutral-500 text-[14px]">계정이 있으신가요?</span>{' '}
          <Link
            to="/login"
            className="text-[#4CB5F9] font-semibold text-[14px] hover:text-[#4CB5F9]/90"
          >
            로그인
          </Link>
        </div>
      </div>
    
  );
};

export default Signup;