import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Link 추가
import logoSvg from '/assets/icons/logo.svg';
import validateAuth from '@/pages/Auth/utils';
import useAuth from '@/hooks/useAuth'; // useAuth 훅 임포트

const Login = () => {
  const [email, setEmail] = useState('');
  const [pwd, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth(); // useAuth 훅 사용
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 추가

  // 만약 사용자가 이미 인증되어 있다면 자동으로 홈으로 리디렉션
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // 로그인 성공 시 Home으로 이동
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setError('');
  }, [email, pwd]);

  // 폼 제출 처리 함수
  const handleSubmit = async e => {
    e.preventDefault();

    const validation = validateAuth({ email, pwd });
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔑 로그인 시도:', email);
      await login(email, pwd);
      console.log('✅ 로그인 성공! 홈으로 이동합니다.');
      navigate('/');
    } catch (error) {
      console.error('❌ 로그인 처리 중 오류:', error);
      setError(error.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[768px] w-full h-screen mx-auto overflow-hidden border border-gray-300 flex flex-col">
      {/* 로그인 폼 박스 */}
      <div className="p-6 sm:p-10 mb-4">
        {/* 로고 */}
        <div className="flex justify-center mb-8">
          <img src={logoSvg} alt="Instagram" className="h-[51px] w-auto" />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}

        {/* 로그인 폼 */}
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
            value={pwd}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-[40%] px-2 py-[9px] bg-[#fafafa] text-sm border border-gray-300 rounded-sm
                    focus:outline-none focus:border-gray-400 placeholder:text-xs text-neutral-800"
          />

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-[40%] mt-2 bg-[#0095F6] text-white py-[7px] rounded text-sm font-semibold
            hover:bg-[#0095F6]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      {/* 회원가입 링크 */}
      <div className="py-4 text-center">
        <span className="text-neutral-500 text-[14px]">계정이 없으신가요?</span>
        <Link
          to="/signup"
          className="text-[#4CB5F9] font-semibold text-[14px] hover:text-[#4CB5F9]/90"
        >
          가입하기
        </Link>
      </div>
    </div>
  );
};

export default Login;
