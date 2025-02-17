import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoSvg from '/assets/icons/logo.svg';
import validateAuth from './utils';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setError('');
  }, [email, password]);

  // 폼 제출 처리 함수
  const handleSubmit = async e => {
    e.preventDefault();

    // 입력값 검증
    const validation = validateAuth({ email, password });
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true); // 로딩 상태 활성화
    setError(''); // 기존 오류 초기화

    try {
      // ✅ MSW 회원가입 API 요청
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pwd }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '회원가입 실패: 다시 시도해주세요.');
      }

      console.log('✅ 회원가입 성공:', data);
      navigate('/login'); // ✅ 회원가입 성공 시 로그인 페이지로 이동
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false); // 로딩 상태 해제
    }
  };

  return (
    <div className="max-w-[768px] w-full h-screen mx-auto overflow-hidden border border-gray-300 flex flex-col">
      {/* 회원가입 폼 박스 */}
      <div className="p-6 sm:p-10 mb-4">
        {/* 로고 */}
        <div className="flex justify-center mb-8">
          <img src={logoSvg} alt="Instagram" className="h-[51px] w-auto" />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}

        {/* 회원가입 폼 */}
        <form
          className="space-y-2 flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          {/* 이메일 입력 */}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-[40%] px-2 py-[9px] bg-[#fafafa] text-sm border border-gray-300 rounded-sm
                    focus:outline-none focus:border-gray-400 placeholder:text-xs text-neutral-800"
          />

          {/* 비밀번호 입력 */}
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-[40%] px-2 py-[9px] bg-[#fafafa] text-sm border border-gray-300 rounded-sm
                    focus:outline-none focus:border-gray-400 placeholder:text-xs text-neutral-800"
          />

          {/* 가입 버튼 */}
          <button
            type="submit"
            className="w-[40%] mt-2 bg-[#0095F6] text-white py-[7px] rounded text-sm font-semibold
            hover:bg-[#0095F6]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? '가입 중...' : '가입'}
          </button>
        </form>
      </div>

      {/* 로그인 링크 */}
      <div className="py-4 text-center">
        <span className="text-neutral-500 text-[14px]">계정이 있으신가요?</span>
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
